import React, { useEffect, useState } from 'react';

// Define a type for the navigation link
interface NavLink {
    label: string;
    url: string;
}

const RandomNavBar: React.FC = () => {
    const [backgroundColor, setBackgroundColor] = useState<string>('');
    const [navLinks, setNavLinks] = useState<NavLink[]>([]);

    useEffect(() => {
        // Generate a random background color
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        setBackgroundColor(randomColor);

        // Define a set of possible navigation links
        const possibleLinks: NavLink[] = [
            { label: 'Home', url: '/' },
            { label: 'About', url: '/about' },
            { label: 'Contact', url: '/contact' },
            { label: 'Services', url: '/services' },
            { label: 'Blog', url: '/blog' },
        ];

        // Randomly select a subset of links
        const shuffledLinks = possibleLinks.sort(() => 0.5 - Math.random());
        setNavLinks(shuffledLinks.slice(0, 3)); // Select 3 random links
    }, []);

    return (
        <nav style={{ backgroundColor, padding: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {navLinks.map((link, index) => (
                <a key={index} href={link.url} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                    {link.label}
                </a>
            ))}
        </nav>
    );
};

export default RandomNavBar;
