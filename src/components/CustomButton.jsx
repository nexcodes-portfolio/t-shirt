import React from 'react'
import state from '../store'
import { useSnapshot } from 'valtio'
import { getContrastingColor } from '../config/helpers'

const CustomButton = ({ type, title, customStyles, handleClick }) => {

    const snap = useSnapshot(state)

    const generateStyles = (type) => {
        switch (type) {
            case 'filled':
                return {
                    backgroundColor: snap.color,
                    color: getContrastingColor(snap.color),

                }
            case 'outline':
                return {
                    borderWidth: '1px',
                    borderColor: snap.color,
                    color: snap.color,
                }
            default:
                return null
        }
    }

    return (
        <button
            className={`px-2 py-1.5 flex-1 rounded-md ${customStyles}`}
            style={generateStyles(type)}
            onClick={handleClick}
        >
            {title}
        </button>
    )
}

export default CustomButton