import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    light: {

    },
    dark: {
        background: "#303841",
        card: "#3A4750",
        text: "#F3F3F3",
        
        accent1: "#2185D5",
        accent2: "#FFD369",
        accent3: "#FF6B6B",
        accent4: "#05f22c",

        border: "rgba(255, 255, 255, 0.15)",
        hover: "rgba(255, 255, 255, 0.10)",

        shadow1: "rgba(0, 0, 0, 0.4)",
        shadow2: "rgba(0, 0, 0, 0.1)",
    }
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState("dark"); // chose theme here

    useEffect(() => {
        const root = document.documentElement;
        const theme = themes[currentTheme];

        if (theme) {
            const root = document.documentElement;

            root.style.setProperty("--background", theme.background);
            root.style.setProperty("--card", theme.card);
            root.style.setProperty("--text", theme.text);
            root.style.setProperty("--accent1", theme.accent1);
            root.style.setProperty("--accent2", theme.accent2);
            root.style.setProperty("--accent3", theme.accent3);
            root.style.setProperty("--accent4", theme.accent4);

            root.style.setProperty("--border", theme.border);
            root.style.setProperty("--hover", theme.hover);

            root.style.setProperty("--shadow1", theme.shadow1);
            root.style.setProperty("--shadow2", theme.shadow2);




        }
    }, [currentTheme]);

    const switchTheme = (themeName) => {
        if (themes[themeName]) setCurrentTheme(themeName);
    };

    return (
        <ThemeContext.Provider value={{ theme: themes[currentTheme], switchTheme, currentTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
