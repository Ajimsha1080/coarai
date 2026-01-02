import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Products from '../components/Products';

export default function Home() {
    return (
        <>
            <Hero />
            <Products />
            <Features />
            <Pricing />
        </>
    );
}
