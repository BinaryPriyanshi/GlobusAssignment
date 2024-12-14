import { Route, Routes } from 'react-router'
import './App.css'
import Home from './routes/Home/Home'
import Question from './routes/Questions/Question'
import PdfUploader from './components/Home/PdfUploader'
import QuizComponent from './routes/Quiz/Quiz'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}>
          <Route index element={<PdfUploader/>}/>
          <Route path="questions" element={<Question />} />
          <Route path="quiz" element={<QuizComponent />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
