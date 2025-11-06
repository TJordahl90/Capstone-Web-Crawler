import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    light: {
        // landing page
        background: "#EEEEEE", // landing page
        webname: "#00ADB5",     // web name color
        aandl: "white",     // register and login box
        text: "white",  // text : register, login, findjob
        textonhover: "white",  // text on hover
        border: "rgba(255, 255, 255, 0.15)",   // border color
        hover: "#00ADB5",      // button on hover
        lightbackground: "white",
        button1: "white",   // login and register button

        // find job page
        background2: "#EEEEEE",  // landing page bg
        // main area 
        background7: "#EEEEEE", // bg
        text6: "#00ADB5",  // text color
        searchbg: "white", // search bar background
        searchtxt: "gray", // searchbar text and placeholder

        tabsbg: "#EEEEEE",          // tab background
        tabstxt: "#393E46",       // tab text
        tabshover: "#00ADB5",     // tab hover color
        tabactive: "#00ADB5",     // active tab color
        tabactivebg: "#EEEEEE",   // active tab background

        contentbg: "#EEEEEE",       // background of the inner content box
        contenttxt: "#393E46",      // text inside content area
        contentborder: "#00ADB5",   // border bottom color
        savebtnbg: "white",           // Save Job button background
        savebtntxt: "#00ADB5",        // Save Job button text color
        savebtnhover: "#00ADB5",      // Save Job hover background
        savebtnhovertxt: "white",     // Save Job hover text

        applybtnbg: "#00ADB5",        // Apply Now button background
        applybtntxt: "white",         // Apply Now button text
        applybtnhover: "#393E46",     // Apply Now hover background
        applybtnhovertxt: "white",    // Apply Now hover text

        cardbg2: "#EEEEEE",          // background for job description cards
        cardtext2: "#393E46",      // text color for job description
        cardborder2: "#00ADB5",    // border color for job description card



        //side panel- Wingpanel - mobile nav
        background3: "#EEEEEE", // sidepanel bg
        text2: "#393E46",  // Jobs, Saved, T,P button
        textonhover2: "white",  // text on hover
        hover2: "#00ADB5",      // button on hover
        lightbackground2: "white",  // light background

        // edit profile
        background4: "#EEEEEE", // edit profile bg
        backbg: "#393E46", // back button bg color
        backtxt: "#00ADB5", // back button text color
        cardbackground: "#EEEEEE", // each card bg color
        title: "gray", // title of each card color
        text3: "#393E46",  // text or description color
        pen: "#7ed2d6",  // pencil edit color
        badgebg: "#00ADB5", // badge bg color
        badgetxt: "white", // badge text color
        textonhover3: "gray",  // text on hover
        hover3: "#00ADB5",      // button on hover
        lightbackground3: "white",  // light background
        button3: "#393E46",   // submit button
        submittxt: "white", // submit text

        // Register and Login page
        background5: "#EEEEEE", // bg
        backbg1: "#00ADB5", // back button, register, login bg color
        backtxt1: "white", // back button text color
        hover4: "#00ADB5",  // button on hover
        textonhover4: "white",  // text on hover
        title1: "gray", // title
        text4: "#393E46",  // text and placeholder color

        // Nav bar
        background6: "#EEEEEE", // bg
        text5: "#00ADB5",  // login or username text
        textonhover5: "gray",  // login or username text hover
        hambuger: "#393E46",  // hambuger button
        hamhover: "#00ADB5",
        hover5: "#00ADB5",  // button on hover
        button2: "white",   // loginbutton
        editbg: "#393E46",  // edit bg
        edithover: "#00ADB5", // hover
        edittxt: "white", // text when hover

    },
    dark :{
        // landing page
        background: "#EEEEEE", // landing page
        webname: "#00ADB5",     // web name color
        aandl: "white",     // register and login box
        text: "white",  // text : register, login, findjob
        textonhover: "white",  // text on hover
        border: "rgba(255, 255, 255, 0.15)",   // border color
        hover: "#00ADB5",      // button on hover
        lightbackground: "white",
        button1: "white",   // login and register button

        // find job page
        background2: "#EEEEEE",  // landing page bg
        // main area 
        background7: "#EEEEEE", // bg
        text6: "#00ADB5",  // text color
        searchbg: "white", // search bar background
        searchtxt: "gray", // searchbar text and placeholder

        tabsbg: "#EEEEEE",          // tab background
        tabstxt: "#00ADB5",       // tab text
        tabshover: "#00ADB5",     // tab hover color
        tabactive: "white",     // active tab color
        tabactivebg: "#00ADB5",   // active tab background

        contentbg: "#EEEEEE",       // background of the inner content box
        contenttxt: "#393E46",      // text inside content area
        contentborder: "#00ADB5",   // border bottom color
        savebtnbg: "white",           // Save Job button background
        savebtntxt: "#00ADB5",        // Save Job button text color
        savebtnhover: "#00ADB5",      // Save Job hover background
        savebtnhovertxt: "white",     // Save Job hover text

        applybtnbg: "#00ADB5",        // Apply Now button background
        applybtntxt: "white",         // Apply Now button text
        applybtnhover: "#393E46",     // Apply Now hover background
        applybtnhovertxt: "white",    // Apply Now hover text

        cardbg2: "#EEEEEE",          // background for job description cards
        cardtext2: "#393E46",      // text color for job description
        cardborder2: "#00ADB5",    // border color for job description card



        //side panel- Wingpanel - mobile nav
        background3: "#393E46", // sidepanel bg
        text2: "white",  // Jobs, Saved, T,P button
        textonhover2: "white",  // text on hover
        hover2: "#00ADB5",      // button on hover
        lightbackground2: "white",  // light background

        // edit profile
        background4: "#EEEEEE", // edit profile bg
        backbg: "#393E46", // back button bg color
        backtxt: "#00ADB5", // back button text color
        cardbackground: "#EEEEEE", // each card bg color
        title: "gray", // title of each card color
        text3: "white",  // text or description color
        pen: "#7ed2d6",  // pencil edit color
        badgebg: "#00ADB5", // badge bg color
        badgetxt: "white", // badge text color
        textonhover3: "gray",  // text on hover
        hover3: "#00ADB5",      // button on hover
        lightbackground3: "white",  // light background
        button3: "#393E46",   // submit button
        submittxt: "white", // submit text

        // Register and Login page
        background5: "#EEEEEE", // bg
        backbg1: "#00ADB5", // back button, register, login bg color
        backtxt1: "white", // back button text color
        hover4: "#00ADB5",  // button on hover
        textonhover4: "white",  // text on hover
        title1: "gray", // title
        text4: "#393E46",  // text and placeholder color

        // Nav bar
        background6: "#EEEEEE", // bg
        text5: "#00ADB5",  // login or username text
        textonhover5: "gray",  // login or username text hover
        hambuger: "white",  // hambuger button
        hamhover: "#00ADB5",
        hover5: "#00ADB5",  // button on hover
        button2: "white",   // loginbutton
        editbg: "#393E46",  // edit bg
        edithover: "#00ADB5", // hover
        edittxt: "white", // text when hover

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
            // Backgrounds
            root.style.setProperty("--bg", theme.background);
            root.style.setProperty("--bg2", theme.background2);
            root.style.setProperty("--bg3", theme.background3);
            root.style.setProperty("--bg4", theme.background4);
            root.style.setProperty("--bg5", theme.background5);
            root.style.setProperty("--bg6", theme.background6);
            root.style.setProperty("--bg7", theme.background7);
            // Light Backgrounds
            root.style.setProperty("--lbg", theme.lightbackground);
            root.style.setProperty("--lbg2", theme.lightbackground2);
            root.style.setProperty("--lbg3", theme.lightbackground3);

            // Text Colors
            root.style.setProperty("--text", theme.text);
            root.style.setProperty("--text2", theme.text2);
            root.style.setProperty("--text3", theme.text3);
            root.style.setProperty("--text4", theme.text4);
            root.style.setProperty("--text5", theme.text5);
            root.style.setProperty("--text6", theme.text6);
            root.style.setProperty("--webname", theme.webname);

            // Hover Text Colors
            root.style.setProperty("--textonhover", theme.textonhover);
            root.style.setProperty("--textonhover2", theme.textonhover2);
            root.style.setProperty("--textonhover3", theme.textonhover3);
            root.style.setProperty("--textonhover4", theme.textonhover4);
            root.style.setProperty("--textonhover5", theme.textonhover5);
            // Borders & Hover Backgrounds
            root.style.setProperty("--border", theme.border);
            root.style.setProperty("--hover", theme.hover);
            root.style.setProperty("--hover2", theme.hover2);
            root.style.setProperty("--hover3", theme.hover3);
            root.style.setProperty("--hover4", theme.hover4);

            // Buttons
            root.style.setProperty("--button1", theme.button1);
            root.style.setProperty("--button2", theme.button2);
            root.style.setProperty("--button3", theme.button3);

            // Navbar
            root.style.setProperty("--hambuger", theme.hambuger);
            root.style.setProperty("--hamhover", theme.hamhover);

            // Back Button
            root.style.setProperty("--backbg", theme.backbg);
            root.style.setProperty("--backbg1", theme.backbg1);
            root.style.setProperty("--backtxt", theme.backtxt);
            root.style.setProperty("--backtxt1", theme.backtxt1);

            // Edit UI
            root.style.setProperty("--editbg", theme.editbg);
            root.style.setProperty("--edithover", theme.edithover);
            root.style.setProperty("--edittxt", theme.edittxt);

            // Misc
            root.style.setProperty("--cardbg", theme.cardbackground);
            root.style.setProperty("--title", theme.title);
            root.style.setProperty("--title1", theme.title1);
            root.style.setProperty("--pen", theme.pen);
            root.style.setProperty("--badgebg", theme.badgebg);
            root.style.setProperty("--badgetxt", theme.badgetxt);
            root.style.setProperty("--submittxt", theme.submittxt);
            root.style.setProperty("--searchbg", theme.searchbg);
            root.style.setProperty("--searchtxt", theme.searchtxt);
            root.style.setProperty("--tabsbg", theme.tabsbg);
            root.style.setProperty("--tabstxt", theme.tabstxt);
            root.style.setProperty("--tabshover", theme.tabshover);
            root.style.setProperty("--tabactive", theme.tabactive);
            root.style.setProperty("--tabactivebg", theme.tabactivebg);
            root.style.setProperty("--contentbg", theme.contentbg);
            root.style.setProperty("--contenttxt", theme.contenttxt);
            root.style.setProperty("--contentborder", theme.contentborder);
            root.style.setProperty("--savebtnbg", theme.savebtnbg);
            root.style.setProperty("--savebtntxt", theme.savebtntxt);
            root.style.setProperty("--savebtnhover", theme.savebtnhover);
            root.style.setProperty("--savebtnhovertxt", theme.savebtnhovertxt);

            root.style.setProperty("--applybtnbg", theme.applybtnbg);
            root.style.setProperty("--applybtntxt", theme.applybtntxt);
            root.style.setProperty("--applybtnhover", theme.applybtnhover);
            root.style.setProperty("--applybtnhovertxt", theme.applybtnhovertxt);

            root.style.setProperty("--cardbg2", theme.cardbg2);
            root.style.setProperty("--cardtext2", theme.cardtext2);
            root.style.setProperty("--cardborder2", theme.cardborder2);

            root.style.setProperty("--cardbg2", theme.cardbg2);
            root.style.setProperty("--cardtext2", theme.cardtext2);
            root.style.setProperty("--cardborder2", theme.cardborder2);


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
