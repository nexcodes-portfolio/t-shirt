import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'
import axios from 'axios'
import config from '../config/config'
import state from '../store'
import { download } from '../assets'
import { downloadCanvasToImage, reader } from '../config/helpers'
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants'
import { fadeAnimation, slideAnimation } from '../config/motion'

import { AIPicker, ColorPicker, FilePicker, CustomButton, Tab } from '../components'

const Customizer = () => {

  const snap = useSnapshot(state)
  // states
  const [file, setFile] = useState('')

  const [prompt, setPrompt] = useState('')
  const [generateImg, setGenerateImg] = useState(false)

  const [activeEditorTab, setActiveEditorTab] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  })

  // show tab content depending on the active Tab
  const generateTabContent = () => {
    switch (activeEditorTab) {

      case "aipicker":

        return <AIPicker
          prompt={prompt}
          setPrompt={setPrompt}
          generateImg={generateImg}
          setGenerateImg={setGenerateImg}
          handleSubmit={handleSubmit}
        />
        break;

      case "colorpicker":

        return <ColorPicker />
        break;

      case "filepicker":

        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
        break;

      default:
        return null
    }
  }

  const handleSubmit = async (type) => {
    if (!prompt) return alert("Please enter a prompt")

    try {

      setGenerateImg(true)

      const options = {
        method: 'POST',
        url: 'https://openai80.p.rapidapi.com/images/generations',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': '7489783a7amshf0c4b41472678fcp1cbe8fjsn4c526a3587eb',
          'X-RapidAPI-Host': 'openai80.p.rapidapi.com'
        },
        data: {
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        }
      };
      
      const response = await axios.request(options);
      
      const photo = response.data.data[0].b64_json;

      handleDecals(type, `data:image/png;base64,${photo}`)

    } catch (error) {

      alert("Something went wrong")

    } finally {

      setGenerateImg(false)
      setActiveEditorTab("")

    }

  }

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type]

    state[decalType.stateProperty] = result

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab)
    }

  }

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName]
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName]
        break;
      default:
        state.isLogoTexture = true
        state.isFullTexture = false
    }

    // after setting the state, activeFilterTab is updated

    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    })
  }

  const readFile = (type) => {
    reader(file)
      .then((result) => {
        handleDecals(type, result)
        setActiveEditorTab("")
      })
  }

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className='absolute top-0 left-0 z-10'
            {...slideAnimation("left")}
          >
            <div className='flex items-center min-h-screen'>
              <div className="editortabs-container tabs">

                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => setActiveEditorTab(tab.name)}
                  />
                ))}

                {generateTabContent()}

              </div>
            </div>

          </motion.div>

          <motion.div
            className='absolute z-10 top-5 right-5'
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => state.intro = true}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          <motion.div
            className='filtertabs-container'
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />

            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer