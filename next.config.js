/** @type {import('next').NextConfig} */

const nextConfig = {
    // Existing settings
    images: {
        unoptimized: true,
    },

    // Webpack configuration for explicitly injecting all required ENV variables
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            
            // Define all environment variables needed by the client.
            // This is necessary for static exports to embed the values.
            const envVars = {
                'process.env.NEXT_PUBLIC_FIREBASE_API_KEY': JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
                'process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
                'process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
                'process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
                'process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
                'process.env.NEXT_PUBLIC_FIREBASE_APP_ID': JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
                'process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
                
                // Define custom globals here as well, if they are still needed
                __app_id: JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'default-app-id'),
                __initial_auth_token: JSON.stringify(null), 
            };

            // CRITICAL DEBUG CHECK:
            console.log('🔥 [NEXT.CONFIG] ENV Injection Status (API Key exists?):', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SUCCESS' : 'FAILURE');

            config.plugins.push(
                new webpack.DefinePlugin(envVars)
            );
        }
        return config;
    },
};

module.exports = nextConfig;