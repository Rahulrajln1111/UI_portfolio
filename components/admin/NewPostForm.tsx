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
    signOut, // 🟢 IMPORTED for logout
    Auth
} from 'firebase/auth'; 
import { initializeApp, FirebaseApp } from 'firebase/app';
// 🟢 LogOut icon imported
import { Loader2, Save, FileText, Upload, CheckCircle, LogOut } from 'lucide-react'; 

import TiptapEditor from './TiptapEditor'; // Assuming this is your VISUAL editor
import { useAuth } from '@/context/auth-context'; // 🟢 ASSUMED: For client state cleanup

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
    onSaveAction: (slug: string) => Promise<void>; 
}

// ----------------------------------------------------
// Persistence Keys
// ----------------------------------------------------
const MARKDOWN_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-markdown';
const FILENAME_LOCAL_STORAGE_KEY = 'ctf-writeup-uploaded-filename'; 

// ----------------------------------------------------
// Dummy MenuBar (Assuming TiptapEditor is defined elsewhere)
// ----------------------------------------------------
const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;
    const getButtonClass = (isActive: boolean) => 
        `px-3 py-1 rounded transition-colors text-sm font-semibold ${
            isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`;
    // Simplified MenuBar logic for brevity
    return (
        <div className="fixed bottom-[80px] left-0 right-0 z-40 max-w-4xl mx-auto px-6">
            <div className="flex flex-wrap items-center space-x-2 p-3 border border-gray-700 bg-gray-800 rounded-lg shadow-xl opacity-95">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={getButtonClass(editor.isActive('bold'))}>Bold</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={getButtonClass(editor.isActive('italic'))}>Italic</button>
            </div>
        </div>
    );
};


// ----------------------------------------------------
// New Post Form Component
// ----------------------------------------------------
export default function NewPostForm({ 
    isNew, 
    initialPost, 
    onSaveAction 
}: NewPostFormProps) {
    
    // 🟢 AUTH/DB State (State declared here fixes the ReferenceError)
    const { setUser } = useAuth() as any; 
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [db, setDb] = useState<Firestore | null>(null);
    const [auth, setAuth] = useState<Auth | null>(null);
    const [isSaving, setIsSaving] = useState(false); 
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [editorInstance, setEditorInstance] = useState<any>(null); 
    
    // 🟢 FILE UPLOAD UI STATE
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(FILENAME_LOCAL_STORAGE_KEY);
        }
        return null;
    });
    const [fileIsLoading, setFileIsLoading] = useState(false);

    // ... (getInitialContent, formData state remain the same) ...
    const getInitialContent = useCallback((post: PostData | null | undefined) => {
        if (post && post.content) { return post.content; }
        if (typeof window !== 'undefined') {
            const uploadedContent = localStorage.getItem(MARKDOWN_LOCAL_STORAGE_KEY);
            if (uploadedContent) { return uploadedContent; }
        }
        return post?.content || ''; 
    }, []);

    const [formData, setFormData] = useState<PostData>(initialPost || {
        title: '',
        slug: '',
        content: getInitialContent(initialPost), 
        tags: '',
        authorName: 'Guest Author',
    });


    const getCollectionPath = useCallback(() => `/artifacts/${firebaseConfig.appId}/public/data/blog_posts`, []);

    
    // --- Initialization Effect (Runs ONLY on client mount) ---
    useEffect(() => {
        if (!firebaseConfig.projectId) { 
            setError("Error: Firebase config is missing 'projectId'. Check .env.local.");
            return;
        }

        try {
            const app: FirebaseApp = initializeApp(firebaseConfig);
            setDb(getFirestore(app));
            setAuth(getAuth(app));
            setError(null); 
        } catch (e) {
            console.error("Firebase Initialization Failed:", e);
            setError("Error: Firebase failed to initialize on the client.");
        }
    }, []); 


    // --- Authentication Effect ---
    useEffect(() => {
        if (!auth) { return; }
        
        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth); 
                }
            } catch (err: any) {
                console.error("Firebase Auth Error during sign-in:", err.code, err.message);
                setError(`Authentication Error: ${err.message}`);
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
    }, [auth, initialAuthToken, isAuthReady]); 

    
    // ----------------------------------------------------
    // CONTENT HANDLERS (Fixed with useCallback)
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

    // 🔥 FIX: Wrap in useCallback to ensure a stable function reference
    const handleContentUpdate = useCallback((markdown: string) => {
        setFormData(prev => ({ ...prev, content: markdown }));
        
        // Clear markdown from localStorage after content is loaded/updated
        if (typeof window !== 'undefined' && localStorage.getItem(MARKDOWN_LOCAL_STORAGE_KEY)) {
            localStorage.removeItem(MARKDOWN_LOCAL_STORAGE_KEY);
            localStorage.removeItem(FILENAME_LOCAL_STORAGE_KEY);
            setUploadedFileName(null); 
        }
    }, [setFormData, setUploadedFileName]); 

    const handleMarkdownUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.endsWith(".md")) { e.target.value = ""; return; }

        setFileIsLoading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setFormData(prev => ({ ...prev, content: content }));
            setUploadedFileName(file.name);
            if (typeof window !== 'undefined') {
                localStorage.setItem(MARKDOWN_LOCAL_STORAGE_KEY, content);
                localStorage.setItem(FILENAME_LOCAL_STORAGE_KEY, file.name);
            }
            setFileIsLoading(false);
        };
        reader.readAsText(file);
        e.target.value = ""; 
    };

    // 🔥 FIX: Wrap in useCallback to prevent infinite re-render loop
    const handleEditorReady = useCallback((editor: any) => { 
        setEditorInstance(editor); 
    }, [setEditorInstance]); 

    // ----------------------------------------------------
    // LOGOUT HANDLER (FIX: Correctly uses the defined 'auth' state)
    // ----------------------------------------------------
    const handleLogout = async () => {
        if (!auth) {
             console.error("Logout failed: Auth object is not initialized.");
             return;
        }
        try {
            await signOut(auth);
            if (setUser) setUser(null); 
        } catch (err) {
            console.error("Logout Error:", err);
            setError("Failed to log out. Try again.");
        }
    };

    // ----------------------------------------------------
    // SAVE HANDLER
    // ----------------------------------------------------
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!db || !auth || !isAuthReady || isSaving) {
            if (!isAuthReady) setError("Authentication not ready. Please wait.");
            else if (!db) setError("Firebase connection not ready.");
            return;
        }

        setError(null);
        setMessage(null);
        setIsSaving(true);
        
        let saveSuccessful = false;

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
            
            // Slug uniqueness check (simplified)
            if (isNew) {
                const q = query(collectionRef, where('slug', '==', formData.slug));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setIsSaving(false);
                    setError(`Error: Slug '${formData.slug}' is already in use.`);
                    return;
                }
                
                postToSave.createdAt = serverTimestamp();
                await addDoc(collectionRef, postToSave);
                setMessage("✅ Post published successfully! Redirecting...");
            } else if (formData.id) {
                const postDocRef = doc(db, getCollectionPath(), formData.id);
                await updateDoc(postDocRef, postToSave);
                setMessage("✅ Post updated successfully!");
            } else {
                throw new Error("Cannot update post: missing document ID.");
            }

            if (typeof window !== 'undefined') {
                localStorage.removeItem(MARKDOWN_LOCAL_STORAGE_KEY);
                localStorage.removeItem(FILENAME_LOCAL_STORAGE_KEY);
            }
            
            saveSuccessful = true;
            
        } catch (err: any) {
            console.error("Save Error:", err);
            setError(`Error Saving: ${err.message || 'An error occurred while saving.'}`);
            setIsSaving(false);
            return; 
        }

        // 2. CALL SERVER ACTION FOR REDIRECTION (Only for New Posts)
        if (saveSuccessful && isNew) {
            try {
                await onSaveAction(formData.slug); 
            } catch (err: any) {
                if (err.message.includes('NEXT_REDIRECT')) {
                    return;
                }
                setError(`Error with post-save action: ${err.message}`);
            }
        }
        
        setIsSaving(false);
    };


    // ----------------------------------------------------
    // RENDER (Full form and upload UI)
    // ----------------------------------------------------

    return (
        <div className="w-full bg-gray-950 pb-[100px]"> 
            <div className="max-w-4xl mx-auto pt-24 pb-4 px-6">
                
                {/* 🟢 HEADER WITH LOGOUT BUTTON */}
                <div className="flex justify-between items-center mb-6">
                     <h1 className="text-3xl font-extrabold text-primary">{isNew ? "Create New Post" : "Edit Post"}</h1>
                     <button
                        onClick={handleLogout} 
                        disabled={isSaving || !isAuthReady} 
                        className="flex items-center text-sm font-semibold text-gray-300 hover:text-red-400 p-2 rounded-lg transition-colors bg-gray-800 hover:bg-red-900/50 disabled:opacity-50"
                     >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                     </button>
                </div>
                {/* END Logout Button */}

                <form onSubmit={handleSave} id="post-form" className="space-y-4">
                    {/* 🚀 FORM INPUTS (Your Blog/Writup Form) */}
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
            
            {/* 🟢 INTEGRATED FILE UPLOAD UI (Your "writup/blog" form area) */}
            <div className="max-w-4xl mx-auto px-6 mb-8">
                <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-gray-400" /> Markdown File Import
                    </h3>
                    <div className="flex flex-col items-center justify-center p-4 text-center">
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
                                {fileIsLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Upload className="mr-3 h-6 w-6" />}
                                {fileIsLoading ? 'Reading File...' : 'Select Markdown File (.md)'}
                            </label>
                        )}
                    </div>
                </div>
            </div>
            {/* END FILE UPLOAD UI */}


            {isAuthReady ? (
                <>
                    <div className="w-full px-6">
                        <TiptapEditor
                            initialContent={formData.content} 
                            onUpdate={handleContentUpdate}
                            onEditorReady={handleEditorReady}
                        />
                    </div>
                    {editorInstance && <MenuBar editor={editorInstance} />} 
                </>
            ) : (
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