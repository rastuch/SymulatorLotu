import React, {useEffect} from 'react';
import ButtonFly from "./ButtonFly.jsx";
import logo from "../models/symulatorLogo.png";
import styles from "./styles.js";

/**
 * Menu component for the Fly Simulator Game.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onStartGame - Function to handle starting the game.
 * @param {Function} props.handlePlayMusic - Function to handle toggling music playback.
 * @returns {JSX.Element} The menu component.
 */
const Menu = ({onStartGame, handlePlayMusic}) => {
    const [showTable, setShowTable] = React.useState(false);
    const [table, setTable] = React.useState([]);
    const [isMusic, setIsMusic] = React.useState(false);

    /**
     * Toggles music playback.
     */
    const togglePlayMusic = () => {
        handlePlayMusic();
        setIsMusic(prevState => !prevState);
    };

    /**
     * Toggles the visibility of the score table.
     */
    const toggleTable = () => {
        setShowTable(prevState => !prevState);
    };

    useEffect(() => {
        const scoreTable = localStorage.getItem('scoreTable');
        if (Array.isArray(JSON.parse(scoreTable))) {
            setTable(JSON.parse(scoreTable));
        }
    }, [showTable]);

    /**
     * Formats a timestamp into a readable date and time string.
     *
     * @function formatDate
     * @param {number} timestamp - The timestamp to format.
     * @returns {string} The formatted date and time string.
     */
    function formatDate(timestamp) {
        const date = new Date(timestamp);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    if (showTable) {
        return (
            <div className="menu font-verdana">
                <h1 className="font-verdana">TOP 10 PLAYERS</h1>
                <table>
                    <thead>
                    <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Score</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {table.map(({score, name, date}, index) => (
                        <tr key={date}>
                            <td>{index + 1}</td>
                            <td>{name}</td>
                            <td>{score} km/h</td>
                            <td>{formatDate(date)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <ButtonFly onClick={toggleTable} text="BACK"/>
            </div>
        );
    }

    return (
        <div className="menu">
            <img src={logo} style={styles.menuLogo}/>
            <h1 className="font-verdana">Welcome to Fly Simulator Game</h1>
            <ButtonFly onClick={onStartGame} text="Start"/>
            <div style={styles.menuSeparator}/>
            <ButtonFly onClick={toggleTable} text="Top 10"/>
            <div style={styles.menuSeparator}/>
            <ButtonFly onClick={togglePlayMusic} text={`Music ${isMusic ? 'on' : 'off'}`}/>
        </div>
    );
};

export default Menu;
