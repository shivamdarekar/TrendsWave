import React from 'react';

const GoogleSignInButton = ({role}) => {

    const handleGoogleSignIn = () => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        // Construct the final URL, preserving the redirect parameter
        const googleAuthUrl = `${backendUrl}/api/auth/google?role=${role}`;
        // Redirect the browser to the Google sign-in flow
        window.location.href = googleAuthUrl;
        
    };

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 p-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-200"
        >
            {/* Inline SVG for the Google logo for fast loading and crisp visuals */}
            <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden="true">
                <path d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h146.9c-6.3 34.1-25.2 62.9-53.6 82.2v68h86.6c50.7-46.7 81.6-115.5 81.6-195z" fill="#4285f4"/>
                <path d="M272 544.3c73.9 0 135.9-24.5 181.2-66.4l-86.6-68c-24.1 16.2-55 25.8-94.6 25.8-72.8 0-134.6-49-156.7-114.9H25.4v72.4C70.2 486 163.7 544.3 272 544.3z" fill="#34a853"/>
                <path d="M115.3 320.8c-10.5-31.1-10.5-64.6 0-95.7V152.7H25.4C-8.5 219.3-8.5 310.9 25.4 377.5l89.9-56.7z" fill="#fbbc05"/>
                <path d="M272 107.7c39.7 0 75.4 13.7 103.4 40.6l77.6-77.6C407.9 25.4 345.9 0 272 0 163.7 0 70.2 58.2 25.4 164.3l89.9 72.4C137.4 156.7 199.2 107.7 272 107.7z" fill="#ea4335"/>
            </svg>
            Continue with Google
        </button>
    );
};

export default GoogleSignInButton;
