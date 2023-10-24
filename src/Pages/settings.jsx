import {Frames} from "./frame"
import { Link, Route, Routes } from "react-router-dom";

export function Settings(){
    return (
        <div>
           <div className="flex flex-row m-2">
        <h1>Settings</h1>
        <div className="w-full flex justify-end ">
          <button type="button" className="hover:bg-cyan-200 bg-slate-400 border-2 border-stone-700 px-2">
            <Link to= "/">
                X
            </Link>

          </button>
        </div>
      </div>

            <Routes>
          <Route path="/frame" element= {<Frames/>}/>
        </Routes>
        </div>
        
    )
}