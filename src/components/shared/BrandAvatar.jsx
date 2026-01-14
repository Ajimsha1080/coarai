import React, { useState } from 'react';

/**
 * Reusable BrandAvatar component
 * Displays a brand logo if available and valid, otherwise falls back to initials.
 * 
 * @param {string} brandName - Name of the brand (used for alt text and initials)
 * @param {string} brandLogoUrl - Optional URL for the brand logo
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} className - Optional additional classes
 */
export default function BrandAvatar({ brandName, brandLogoUrl, size = 'md', className = '' }) {
    const [imgError, setImgError] = useState(false);

    // Initial Logic: First letter of first two words
    const getInitials = (name) => {
        if (!name) return '??';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    };

    // Size Helper
    const sizeClasses = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
        xl: 'w-12 h-12 text-base'
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;
    const showImage = brandLogoUrl && !imgError;

    return (
        <div
            className={`
                relative rounded-full flex items-center justify-center font-bold 
                ring-1 ring-slate-200 ring-offset-1 
                overflow-hidden shrink-0 
                bg-white
                ${currentSize} 
                ${className}
            `}
            title={showImage ? `Brand logo` : `Brand logo not provided`}
        >
            {showImage ? (
                <img
                    src={brandLogoUrl}
                    alt={`Brand logo for ${brandName}`}
                    className="w-full h-full object-contain p-0.5" // object-contain to avoid distortion, slight padding
                    onError={() => setImgError(true)}
                />
            ) : (
                <span className="text-slate-500 bg-slate-50 w-full h-full flex items-center justify-center">
                    {getInitials(brandName)}
                </span>
            )}
        </div>
    );
}
