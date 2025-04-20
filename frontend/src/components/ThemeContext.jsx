import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    gold: {
        background: "#c9c6a5",
        text: "#4d4c43",
        textonhover: "white",
        border: "#8f650a",
        lightbackground: "#e6e4cf",
        hover: "#8f650a"
    },
    blue: {
        background: "#1e3a8a", // main area background
        text: "#dbeafe",     // text color
        textonhover: "#ffffff",  // text on hover
        border: "#3b82f6",   // border color
        lightbackground: "#1e40af",  // light background for sidepanel, header, phone-nav
        hover: "#2563eb",      // button on hover
        text2:"black",      // 
        button1:"white",   // login and register button
        background2:"#465a9e",  // user edit card background
        hover2:"#90a0d4",  // for submit button
    },
    light: {
        background: "#EEEEEE", // main area background
        text: "#393E46",     // text color
        textonhover: "gray",  // text on hover
        border: "#00ADB5",   // border color
        lightbackground: "white",  // light background for sidepanel, header, phone-nav
        hover: "#00ADB5",      // button on hover
        text2:"white",      // 
        button1:"white",   // login and register button
        background2:"white",  // user edit card background
        hover2:"#00ADB5",  // for submit button
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
            root.style.setProperty("--bg", theme.background);
            root.style.setProperty("--bg2", theme.background2);
            root.style.setProperty("--text", theme.text);
            root.style.setProperty("--lbg", theme.lightbackground);
            root.style.setProperty("--hovertext", theme.textonhover);
            root.style.setProperty("--border", theme.border);
            root.style.setProperty("--hover", theme.hover);
            root.style.setProperty("--hover2", theme.hover2);
            root.style.setProperty("--text2", theme.text2);
            root.style.setProperty("--button1", theme.button1);
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
