'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    serverTimestamp,
    query,
    where,
    getDocs,
    Firestore
} from 'firebase/firestore';
import {
    getAuth, 
    signInWithCustomToken, 
    signInAnonymously,
    onAuthStateChanged,
    Auth
} from 'firebase/auth'; 
import { initializeApp, FirebaseApp } from 'firebase/app';
// 🟢 Import all necessary icons for file upload UI
import { Loader2, Save, FileText, Upload, CheckCircle } from 'lucide-react'; 

import TiptapEditor from './TiptapEditor'; // Assuming this is your VISUAL editor

// --- Configuration Read and Safe Parsing ---
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string | null;

const appId = String(typeof __app_id !== 'undefined' ? __app_id : process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'default-app-id');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let parsedConfig: any = {};
try {
    const rawConfigValue = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
    const configString = String(rawConfigValue); 
    parsedConfig = JSON.parse(configString.trim());
} catch (e) {
    console.warn("Webpack Injection Failed to Parse. Attempting fallback to process.env.", e);
}

const firebaseConfig = {
    apiKey: parsedConfig.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: parsedConfig.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: parsedConfig.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 
    storageBucket: parsedConfig.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: parsedConfig.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: parsedConfig.appId || appId, 
    measurementId: parsedConfig.measurementId || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
// ---------------------------------

interface PostData {
    id?: string;
    title: string;
    slug: string;
    content: string;
    tags: string;
    authorName: string;
    createdAt?: any;
    updatedAt?: any;
}

interface NewPostFormProps {
    isNew: boolean;
    initialPost?: PostData | null;
    onSaveSuccess: (slug: string) => Promise<void>; 
}

// ----------------------------------------------------
// Persistence Keys
// ----------------------------------------------------
const MARKDOWN_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-markdown';
const FILENAME_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-filename'; 


// ----------------------------------------------------
// TipTap Menu Bar (Auxiliary Component) 
// ----------------------------------------------------
const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;
    const getButtonClass = (isActive: boolean) => 
        `px-3 py-1 rounded transition-colors text-sm font-semibold ${
            isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`;

    const addImage = useCallback(() => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url, alt: 'Image description' }).run();
        }
    }, [editor]);
     
    const toggleCodeBlock = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().setParagraph().toggleCodeBlock().run();
    }, [editor]);

    return (
        <div className="fixed bottom-[80px] left-0 right-0 z-40 max-w-4xl mx-auto px-6">
            <div className="flex flex-wrap items-center space-x-2 p-3 border border-gray-700 bg-gray-800 rounded-lg shadow-xl opacity-95">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={getButtonClass(editor.isActive('bold'))}>Bold</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={getButtonClass(editor.isActive('italic'))}>Italic</button>
                <button onClick={toggleCodeBlock} className={getButtonClass(editor.isActive('codeBlock'))}>Code Block</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={getButtonClass(editor.isActive('heading', { level: 1 }))}>H1</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getButtonClass(editor.isActive('heading', { level: 2 }))}>H2</button>
                <button onClick={addImage} className={getButtonClass(editor.isActive('image'))}>Image URL</button>
            </div>
        </div>
    );
};


// ----------------------------------------------------
// New Post Form Component
// ----------------------------------------------------
export default function NewPostForm({ isNew, initialPost, onSaveSuccess }: NewPostFormProps) {
    // 🟢 AUTH/DB State
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [db, setDb] = useState<Firestore | null>(null);
    const [auth, setAuth] = useState<Auth | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [editorInstance, setEditorInstance] = useState<any>(null); 
    
    // 🟢 FILE UPLOAD UI STATE
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(() => {
        // Load persisted file name on mount
        if (typeof window !== 'undefined') {
            return localStorage.getItem(FILENAME_LOCAL_STORAGE_KEY);
        }
        return null;
    });
    const [fileIsLoading, setFileIsLoading] = useState(false);

    // ----------------------------------------------------
    // INITIALIZATION & PERSISTENCE CHECK
    // ----------------------------------------------------

    const getInitialContent = useCallback((post: PostData | null | undefined) => {
        if (post && post.content) {
            return post.content; // 1. Editing existing post (highest priority)
        }
        
        if (typeof window !== 'undefined') {
            // 2. Check for content persisted from a file upload
            const uploadedContent = localStorage.getItem(MARKDOWN_LOCAL_STORAGE_KEY);
            if (uploadedContent) {
                return uploadedContent;
            }
        }
        
        return post?.content || ''; 
    }, []);

    const [formData, setFormData] = useState<PostData>(initialPost || {
        title: '',
        slug: '',
        // 🟢 FIX 1: Initialize content using persistence check
        content: getInitialContent(initialPost), 
        tags: '',
        authorName: 'Guest Author',
    });


    const getCollectionPath = useCallback(() => `/artifacts/${firebaseConfig.appId}/public/data/blog_posts`, []);

    
    // --- Initialization Effect (Runs ONLY on client mount) ---
    useEffect(() => {
        if (!firebaseConfig.projectId) { 
            setError("Error: Firebase config is missing 'projectId'. Check .env.local and next.config.js.");
            return;
        }

        try {
            const app: FirebaseApp = initializeApp(firebaseConfig);
            setDb(getFirestore(app));
            setAuth(getAuth(app));
            setError(null); 
        } catch (e) {
            console.error("Firebase Initialization Failed:", e);
            setError("Error: Firebase failed to initialize on the client. Check console for details.");
        }
    }, []); 


    // --- Authentication Effect ---
    useEffect(() => {
        if (!auth) {
             if (!error) { 
                 setIsAuthReady(false);
             }
             return;
        }
       
        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth); 
                }
            } catch (err: any) {
                console.error("Firebase Auth Error during sign-in:", err.code, err.message);
                setError(`Authentication Error: ${err.message || 'Failed to sign in. Is Anonymous Auth enabled?'}`);
            } finally {
                setIsAuthReady(true); 
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user: any) => {
            if (user) {
                setIsAuthReady(true); 
            }
            if (!user && !isAuthReady) {
                 authenticate();
            }
        });

        return () => unsubscribe();
    }, [auth, initialAuthToken, error, isAuthReady]); 

    
    // ----------------------------------------------------
    // CONTENT HANDLERS
    // ----------------------------------------------------
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (error) setError(null);
       
        setFormData(prev => {
            const newFormData = { ...prev, [name]: value };
           
            if (name === 'title' && isNew && prev.slug === '') {
                newFormData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            return newFormData;
        });
    };

    // 🟢 Handler for content changes from the VISUAL editor
    const handleContentUpdate = (markdown: string) => {
        setFormData(prev => ({ ...prev, content: markdown }));
        
        // Clear file persistence state if the user starts typing/editing manually
        if (typeof window !== 'undefined' && localStorage.getItem(MARKDOWN_LOCAL_STORAGE_KEY)) {
            localStorage.removeItem(MARKDOWN_LOCAL_STORAGE_KEY);
            localStorage.removeItem(FILENAME_LOCAL_STORAGE_KEY);
            setUploadedFileName(null); // Clear local UI state
        }
    };
    
    // 🟢 FILE UPLOAD HANDLER (INTEGRATED)
    const handleMarkdownUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".md")) {
             // You'll need to define a proper useToast or replace this line
             // if (typeof (window as any).toast === 'function') (window as any).toast({ title: "Error", description: "Please select a valid Markdown (.md) file.", variant: "destructive" });
            e.target.value = "";
            return;
        }

        setFileIsLoading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            
            // 🟢 CRITICAL: Update main form data state
            setFormData(prev => ({ ...prev, content: content }));

            // 🟢 CRITICAL: Set UI state and persistence for recovery
            setUploadedFileName(file.name);
            if (typeof window !== 'undefined') {
                localStorage.setItem(MARKDOWN_LOCAL_STORAGE_KEY, content);
                localStorage.setItem(FILENAME_LOCAL_STORAGE_KEY, file.name);
            }

            // if (typeof (window as any).toast === 'function') (window as any).toast({ title: "File Loaded", description: `${file.name} is ready for saving.` });

            setFileIsLoading(false);
        };
        
        reader.readAsText(file);
        e.target.value = ""; 
    };

    const handleEditorReady = (editor: any) => {
        setEditorInstance(editor);
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!db || !auth || !isAuthReady || isSaving) {
            if (!isAuthReady) setError("Authentication not ready. Please wait.");
            else if (!db) setError("Firebase connection not ready. Check configuration.");
            return;
        }

        setError(null);
        setMessage(null);
        setIsSaving(true);

        try {
            const collectionRef = collection(db, getCollectionPath());
            const postToSave: any = {
                title: formData.title,
                slug: formData.slug,
                content: formData.content,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                authorName: formData.authorName,
                updatedAt: serverTimestamp(),
                userId: auth.currentUser?.uid || 'anonymous',
            };

            // --- Slug uniqueness check (for new posts or when slug changed)
            if (isNew || formData.slug !== (initialPost?.slug || '')) {
                const q = query(collectionRef, where('slug', '==', formData.slug));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== initialPost?.id)) {
                    setIsSaving(false);
                    setError(`Error: Slug '${formData.slug}' is already in use.`);
                    return;
                }
            }

            if (isNew) {
                // Create new post
                postToSave.createdAt = serverTimestamp();
                await addDoc(collectionRef, postToSave);

                setMessage("✅ Post published successfully!");
            } else if (formData.id) {
                // Update existing post
                const postDocRef = doc(db, getCollectionPath(), formData.id);
                await updateDoc(postDocRef, postToSave);

                setMessage("✅ Post updated successfully!");
            }

            // 🟢 FIX 2: Clear local storage on successful save
            if (typeof window !== 'undefined') {
                localStorage.removeItem(MARKDOWN_LOCAL_STORAGE_KEY);
                localStorage.removeItem(FILENAME_LOCAL_STORAGE_KEY);
            }
            
            // If successfully saved, run the success callback (which might redirect)
            if (isNew) {
                // The post slug is used here, assuming you retrieved it from the addDoc result or use a unique ID/slug.
                // For this example, we'll use formData.slug.
                await onSaveSuccess(formData.slug); 
            }

            setIsSaving(false);
            return;

        } catch (err: any) {
            console.error("Save Error:", err);
            setError(`Error Saving: ${err.message || 'An error occurred while saving.'}`);
            setIsSaving(false);
        }
    };


    // ----------------------------------------------------
    // RENDER
    // ----------------------------------------------------

    return (
        <div className="w-full bg-gray-950 pb-[100px]"> 
            <div className="max-w-4xl mx-auto pt-24 pb-4 px-6">
                <form onSubmit={handleSave} id="post-form" className="space-y-4">
                    <h1 className="text-3xl font-extrabold text-primary mb-6">{isNew ? "Create New Post" : "Edit Post"}</h1>

                    <input
                        type="text"
                        name="title"
                        placeholder="Post Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full text-2xl p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary placeholder-gray-500 text-white"
                    />
                    <input
                        type="text"
                        name="slug"
                        placeholder="slug-for-post"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="w-full text-lg p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary placeholder-gray-500 text-white font-mono"
                    />
                    <p className="text-sm text-gray-400">URL: /blog/{formData.slug}</p>
                   
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            name="authorName"
                            placeholder="Author Name"
                            value={formData.authorName}
                            onChange={handleChange}
                            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-white"
                        />
                        <input
                            type="text"
                            name="tags"
                            placeholder="Tags (comma separated: tech, life, code)"
                            value={formData.tags}
                            onChange={handleChange}
                            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-white"
                        />
                    </div>
                </form>
            </div>

            <div className="max-w-4xl mx-auto px-6 mb-4">
                {(error || message) && (
                    <div className={`p-4 rounded-lg text-sm ${error ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                        {error || message}
                    </div>
                )}
                <label className="block text-lg font-medium text-gray-300 mb-2">Content Editor</label>
            </div>
            
            {/* 🟢 INTEGRATED FILE UPLOAD UI */}
            <div className="max-w-4xl mx-auto px-6 mb-8">
                <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-gray-400" /> Markdown File Import
                    </h3>
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        
                        {/* 1. HIDDEN FILE INPUT (.md only) */}
                        <input
                            id="markdown-upload-editor-input"
                            type="file"
                            accept=".md"
                            className="hidden"
                            onChange={handleMarkdownUpload}
                            disabled={fileIsLoading}
                        />
                        
                        {uploadedFileName ? (
                            <div className="p-4 border border-green-500 bg-green-900/20 rounded-lg text-green-400 max-w-lg">
                                <p className="font-semibold flex items-center justify-center mb-2">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    {uploadedFileName} loaded.
                                </p>
                                <p className="text-sm mt-2">
                                    <label 
                                        htmlFor="markdown-upload-editor-input" 
                                        className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                                    >
                                        Click here to upload a different file or edit the content below.
                                    </label>
                                </p>
                            </div>
                        ) : (
                            <label 
                                htmlFor="markdown-upload-editor-input" 
                                className="flex items-center px-8 py-4 text-lg font-bold rounded-xl transition duration-150 shadow-xl cursor-pointer bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50"
                                aria-disabled={fileIsLoading}
                            >
                                {fileIsLoading ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Upload className="w-6 h-6 mr-3" />}
                                {fileIsLoading ? 'Reading File...' : 'Select Markdown File (.md)'}
                            </label>
                        )}
                    </div>
                </div>
            </div>
            {/* END INTEGRATED FILE UPLOAD UI */}


            {isAuthReady ? (
                <>
                    <div className="w-full px-6">
                        <TiptapEditor
                            // 🟢 Pass the content, which might be from a persisted file
                            initialContent={formData.content} 
                            onUpdate={handleContentUpdate}
                            onEditorReady={handleEditorReady}
                        />
                    </div>
                    {editorInstance && <MenuBar editor={editorInstance} />}
                </>
            ) : (
                // 🟢 FIX FOR BUILD ERROR: The actual loading JSX block must be here
                <div className="flex items-center justify-center min-h-[500px] text-gray-400">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                    <span className="text-xl">{error ? `Configuration Error: ${error}` : 'Initializing editor and authentication...'}</span>
                </div>
            )}
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur-sm z-50 shadow-2xl border-t border-gray-700">
                <div className="max-w-4xl mx-auto">
                    <button
                        type="submit"
                        form="post-form" 
                        disabled={isSaving || !isAuthReady} 
                        className={`w-full flex items-center justify-center p-3 text-lg font-semibold rounded-lg transition-colors ${
                            isSaving || !isAuthReady
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-5 w-5" />
                                {isNew ? 'Publish New Post' : 'Update Post'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}