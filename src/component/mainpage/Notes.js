import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

function Notes() {
  const navigate = useNavigate()
  return (
    <div>
      <h1>Notes</h1>

      <button
            className="floating-btn"
            onClick={() => navigate('/Mainpage/Note')}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
    </div>
  )
}

export default Notes
