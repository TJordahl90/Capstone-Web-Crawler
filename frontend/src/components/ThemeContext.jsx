import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    light: {
        background: "#F5F7FB",      // soft cool white
        card: "#FFFFFF",            // pure white card
        text: "#3A4750",            // near-black for perfect contrast

        accent1: "#2185D5",         // same blue (works for both themes)
        accent2: "#2185D5",         // softer version of gold/yellow
        accent3: "#FF6B6B",         // same coral accent
        accent4: "#2ECC71",         // lighter green for light mode

        border: "rgba(0, 0, 0, 0.15)",  // inverse of dark mode border
        hover: "rgba(0, 0, 0, 0.05)",   // subtle hover darkening

        shadow1: "rgba(0, 0, 0, 0.15)", // light-mode drop shadow
        shadow2: "rgba(0, 0, 0, 0.05)", // lighter elevation

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
    const [currentTheme, setCurrentTheme] = useState("light"); // chose theme here

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
