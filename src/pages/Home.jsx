import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Products from '../components/Products';
import Pricing from '../components/Pricing';

export default function Home() {
    return (
        <div className="flex flex-col gap-0">
            <Hero />
            <div id="features">
                <Features />
            </div>
            <div id="products">
                <Products />
            </div>
            <div id="pricing">
                <Pricing />
            </div>
        </div>
    );
}
