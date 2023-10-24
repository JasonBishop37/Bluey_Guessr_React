import { useMemo, useState, useEffect, useRef } from "react";

//const apiKey = import.meta.env.VITE_SOME_KEY;
const api = "https://jason37.pythonanywhere.com/frameapp/";
const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_SOME_KEY}`,
};

// npx tailwindcss -i ./src/index.css -o ./src/output.css --watch
function App() {
  const name_weight = 1;
  const pattern = /^[a-zA-Z].{2}[a-zA-Z].{2}$/;
  const [overview_weight, setoverview_weight] = useState(0.5);
  const [overview_weight_old, setoverview_weight_old] = useState(0.5);
  const [fuzziness] = useState(75);
  const [image, setImage] = useState([]);
  const [episodeData, setEpisodeData] = useState(null);
  const [episode_number, setEpisodeNumber] = useState(null);
  const [episode_name, setEpisodeName] = useState(null);
  const [frame_time, setFrameTime] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isChecked, setIsChecked] = useState(true);
  const [isNewFrameDisabled, setIsFrameDisabled] = useState(true);
  const [isSkipDisabled, setIsSkipDisabled] = useState(true);
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  const [showButton, setShoWButtton] = useState(false);
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(0);
  const [messages, setMessages] = useState(
    "Guess the Bluey episode that the frame is randomly selected from using the search box."
  );
  const [copyVal, setCopyVal] = useState("📋 Copy");
  const [textDisabled, setTextDisabled] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(0);
  const [guessTime, setGuessTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [isFinished, setFinished] = useState(false);
  const [isGettingResult, setIsGettingResult] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (result != null) {
        if (e.key === "ArrowUp" && focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1);
        } else if (e.key === "ArrowDown" && focusedIndex < result.length - 1) {
          setFocusedIndex(focusedIndex + 1);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, result]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && !isGettingResult) {
        if (focusedIndex > -1) {
          const episods = result[focusedIndex];

          checkvalue(
            `S${
              episods.season_number < 10
                ? "0" + episods.season_number
                : episods.season_number
            }E${
              episods.episode_number < 10
                ? "0" + episods.episode_number
                : episods.episode_number
            }`
          );
        } else if (isSkipDisabled) {
          newFrame();
        } else {
          setInputValue(event.target.value);
          checkvalue(inputValue);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async (signal) => {
      try {
        fetch(`${api}get_episode_name/`, { headers, signal })
          .then((response) => response.text())
          .then((data) => {
            setEpisodeData(data);
            return fetch(`${api}get_image/${data}/`, { headers });
          })
          .then((imageResponse) => imageResponse.blob())
          .then((imageBlob) => {
            const imageUrl = URL.createObjectURL(imageBlob);
            setImage(imageUrl);
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const get_episode = () => {
    const controller = new AbortController();
    const fetchData = async (signal) => {
      try {
        fetch(`${api}get_episode_name/`, { headers, signal })
          .then((response) => response.text())
          .then((data) => {
            setEpisodeData(data);
            return fetch(`${api}get_image/${data}/`, { headers });
          })
          .then((imageResponse) => imageResponse.blob())
          .then((imageBlob) => {
            const imageUrl = URL.createObjectURL(imageBlob);
            setImage(imageUrl);
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(controller.signal);
    return () => {
      controller.abort();
    };
  };

  const seachclick = (event, message) => {
    setIsSkipDisabled(!isSkipDisabled);
    setTextDisabled(true);
    setInputValue("");
    checkvalue(message);
  };

  const decrypt = async () => {
    try {
      const response = await fetch(`${api}decrypt/${episodeData}/`, {
        headers,
      });
      const data = await response.json();
      setEpisodeNumber(data.episode_number);
      setEpisodeName(data.episode_name);
      setFrameTime(data.frame_time);
      setFinished(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isFinished) {
      const message = ` ${episode_number} ${episode_name} @ ${Math.floor(
        frame_time / 60
      )}:${(frame_time % 60).toFixed(2)}`;
      setIsFrameDisabled(!isNewFrameDisabled);

      toggleButton3();

      setIsRunning(false);
      setResult(null);
      setFocusedIndex(-1);
      setShoWButtton(true);

      if (value === "" || !pattern.test(value)) {
        setMessages(
          <p>
            <span className="text-gray-600 font-bold">⏩ Skipped</span>
            {`: ${message}`}
          </p>
        );
        setValue2(value2 + 1);

        setStreak(0);
      } else if (
        value.substring(1, 3) == episode_number.substring(1, 3) &&
        value.substring(4, 6) == episode_number.substring(4, 6)
      ) {
        setMessages(
          <p>
            <span className="text-green-400 font-bold">✅Correct</span>
            {`: ${message}`}
          </p>
        );
        setValue1(value1 + 1);
        setValue2(value2 + 1);

        setStreak(streak + 1);
      } else if (
        value.substring(1, 3) !== episode_number.substring(1, 3) ||
        value.substring(4, 6) !== episode_number.substring(4, 6)
      ) {
        setMessages(
          <p>
            S{value.substring(1, 3)}E{value.substring(4, 6)} is{" "}
            <span className="text-red-600 font-bold">❌ Incorrect</span>
            {`. Answer: ${message}`}
          </p>
        );
        setValue2(value2 + 1);

        setStreak(0);
      }

      setFinished(false);
      setIsGettingResult(false);
    }
  }, [isFinished]);

  const checkvalue = async (values) => {
    setValue(values);
    setIsGettingResult(true);
    await decrypt();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    clearTimeout(timer);

    const newTimer = setTimeout(() => {
      if (inputValue != "") {
        sendDataToApi();
      }
    }, 500);

    setTimer(newTimer);
  };

  const sendDataToApi = async () => {
    try {
      const response = await fetch(
        `${api}search/${inputValue}/${fuzziness}/${name_weight}/${overview_weight}/`,
        { headers }
      );
      const data = await response.json();
      setResult(data);

      // Handle the API response data as needed
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    if (!isChecked) {
      setoverview_weight(overview_weight_old);
    } else {
      setoverview_weight_old(overview_weight);
      setoverview_weight(0);
    }
  };

  const toggleButton3 = () => {
    if (value2 == 0) {
      setIsResetDisabled(!isResetDisabled);
    }
  };

  const Reset = () => {
    setValue1(0);
    setValue2(0);
    setIsResetDisabled(true);
    setTime(0);
    setGuessTime(0);
    setCurrentTime(0);
  };

  const newFrame = () => {
    get_episode();
    setMessages(
      "Guess the Bluey episode that the frame is randomly selected from using the search box."
    );
    setIsFrameDisabled(!isNewFrameDisabled);
    setShoWButtton(false);
    setCopyVal("📋 Copy");
    setTextDisabled(false);
    loadingStart();
    inputRef.current.focus();
  };

  const clipboard = (e, value) => {
    navigator.clipboard.writeText(value);
    setCopyVal("📋 Copied");
  };

  const about = () => {
    setShowAbout(!showAbout);
    if (showSettings) {
      settings();
    }
  };

  const settings = () => {
    setShowSettings(!showSettings);
    if (showAbout) {
      about();
    }
  };

  const more = () => {
    setShowMore(!showMore);
  };

  const loading = () => {
    setIsLoading(!loading);
    setIsSkipDisabled(false);
    setIsRunning(true);
    setShowImage(true);
    setCurrentTime(0);
  };

  const loadingStart = () => {
    setIsLoading(true);

    setShowImage(false);
  };

  useEffect(() => {
    let intervalId;

    // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
    intervalId = setInterval(() => setTime(time + 1), 10);

    return () => clearInterval(intervalId);
  }, [time]);

  useEffect(() => {
    let intervalId;

    // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
    if (isRunning) {
      intervalId = setInterval(() => setGuessTime(guessTime + 1), 10);
    }

    return () => clearInterval(intervalId);
  }, [isRunning, guessTime]);

  useEffect(() => {
    let intervalId;

    // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
    if (isRunning) {
      intervalId = setInterval(() => setCurrentTime(currentTime + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, currentTime]);

  // Hours calculation
  const hours = Math.floor(time / 360000);
  const hours1 = Math.floor(guessTime / 360000);
  const hours2 = Math.floor(currentTime / 360000);

  // Minutes calculation
  const minutes = Math.floor((time % 360000) / 6000);
  const minutes1 = Math.floor((guessTime % 360000) / 6000);
  const minutes2 = Math.floor((currentTime % 360000) / 6000);

  // Seconds calculation
  const seconds = Math.floor((time % 6000) / 100);
  const seconds1 = Math.floor((guessTime % 6000) / 100);
  const seconds2 = Math.floor((currentTime % 6000) / 100);

  // Milliseconds calculation
  const milliseconds = time % 100;
  const milliseconds1 = guessTime % 100;
  const milliseconds2 = currentTime % 100;

  const episodeList = useMemo(() => {
    // Calculate the list of episodes here
    // This can be the code where you map over the result array
    if (result !== null && result.map) {
      return result.map((episode, index) => (
        <li
          key={index}
          className={`border-2 border-gray-950 pl-1 py-1 leading-tight cursor-pointer ${
            index === focusedIndex ? " bg-black text-white" : ""
          }`}
          onClick={(event) =>
            seachclick(
              event,
              `S${
                episode.season_number < 10
                  ? "0" + episode.season_number
                  : episode.season_number
              }E${
                episode.episode_number < 10
                  ? "0" + episode.episode_number
                  : episode.episode_number
              }`
            )
          }
          onMouseEnter={() => setFocusedIndex(index)}
        >
          <h2>
            S
            {episode.season_number < 10
              ? "0" + episode.season_number
              : episode.season_number}
            E
            {episode.episode_number < 10
              ? "0" + episode.episode_number
              : episode.episode_number}{" "}
            {episode.perLanguage[0].name}
          </h2>
          {isChecked ? <p>{episode.perLanguage[0].overview}</p> : <p></p>}
        </li>
      ));
    } else {
      // Return a default value if result is not ready
      return <p>Loading...</p>;
    }
  }, [result, focusedIndex, isChecked, seachclick]); // Make sure to include 'result' as a dependency

  return (
    <>
      <div className={`flex flex-col  h-screen overflow-y-hidden`}>
        <div className="flex flex-row w-full bg-slate-300 h-14 whitespace-nowrap ">
          <label className="text-4xl font-bold px-2 pt-1">Bluey Guessr</label>
          <div className="flex justify-end w-full items-center py-1">
            <button
              type="button"
              className="hover:bg-cyan-200 px-5 py-2 bg-slate-400 border-2 mr-1 border-stone-700"
              onClick={about}
            >
              📖 About
            </button>
            {/* <button
              type="button"
              className="hover:bg-cyan-200 px-5 py-2 bg-slate-400 border-2 mr-1 border-stone-700"
              onClick={settings}
            >
              ⚙ Settings
              
            </button> */}
          </div>
        </div>

        {showAbout ? (
          <div className="absolute  h-screen bg-white w-[35%] p-2 border-8 border-stone-700">
            <div className="flex flex-row m-2">
              <h1 className="text-2xl font-bold">About</h1>
              <div className="w-full flex justify-end ">
                <button
                  type="button"
                  className="hover:bg-cyan-200 bg-slate-400 border-2 border-stone-600 px-3 py-1"
                  onClick={about}
                >
                  X
                </button>
              </div>
            </div>
            <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-600 mr-4"></hr>
          </div>
        ) : (
          ""
        )}

        {showSettings ? (
          <div className="absolute  h-screen bg-white w-[35%] p-2 border-8 border-stone-700">
            <div className="flex flex-row m-2">
              <h1 className="text-2xl font-bold">Settings</h1>
              <div className="w-full flex justify-end ">
                <button
                  type="button"
                  className="hover:bg-cyan-200 bg-slate-400 border-2 border-stone-600 px-3 py-1"
                  onClick={settings}
                >
                  X
                </button>
              </div>
            </div>
            <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-600 mr-4"></hr>
          </div>
        ) : (
          ""
        )}

        <div className="flex flex-col sm:flex-row h-full overflow-y-hidden ">
          <div className="  flex flex-col overflow-y-auto overflow-x-hidden pl-2 mr-2 w-full order-last sm:w-[45%]  sm:order-first">
            <div className="pt-2 pb-2">
              <button
                type="button"
                className={` px-5 py-2 bg-slate-300 border-2 mr-1 mb-1 border-stone-700 ${
                  isNewFrameDisabled ? "text-gray-400" : "hover:bg-cyan-200"
                }
              
                `}
                onClick={newFrame}
                disabled={isNewFrameDisabled}
              >
                🎞 New Frame
              </button>
              <button
                type="button"
                className={` px-5 py-2 bg-slate-300 border-2 mr-1 mb-1 border-stone-700 ${
                  isSkipDisabled ? "text-gray-400" : "hover:bg-cyan-200"
                }`}
                onClick={(event) => seachclick(event, "")}
                disabled={isSkipDisabled}
              >
                ⏩ Skip
              </button>
              <button
                type="button"
                className={` px-5 py-2 bg-slate-300 border-2 mr-1 mb-1 border-stone-700 ${
                  isResetDisabled ? "text-gray-400" : "hover:bg-cyan-200"
                }`}
                onClick={Reset}
                disabled={isResetDisabled}
              >
                🔁 Reset
              </button>
            </div>
            <div className={`flex flex-${showMore ? "col" : "row"}`}>
              <label className="pr-4">
                {value1} / {value2} (
                {value2 != 0 ? ((value1 / value2) * 100).toFixed(2) : 0}%)
              </label>
              {showMore ? (
                <div className="flex flex-col">
                  <label>Streak: {streak}</label>
                  <label>
                    real time: {hours}:{minutes.toString().padStart(2, "0")}:
                    {seconds.toString().padStart(2, "0")}:
                    {milliseconds.toString().padStart(2, "0").substr(0, 1)}
                  </label>
                  <label>
                    real time to guess: {hours1}:
                    {minutes1.toString().padStart(2, "0")}:
                    {seconds1.toString().padStart(2, "0")}:
                    {milliseconds1.toString().padStart(2, "0").substr(0, 1)}
                  </label>
                  <label>
                    current guess time: {hours2}:
                    {minutes2.toString().padStart(2, "0")}:
                    {seconds2.toString().padStart(2, "0")}:
                    {milliseconds2.toString().padStart(2, "0").substr(0, 1)}
                  </label>
                </div>
              ) : (
                ""
              )}
              <button
                type="button"
                className={`w-16  bg-slate-300 border-2 border-stone-700 pl-1 mr-1 pr-1 hover:bg-cyan-200 ${
                  showMore ? " text-sm" : "text-xs"
                }`}
                onClick={more}
              >
                {showMore ? "<< Less" : ">> More"}
              </button>
            </div>
            <label>{messages}</label>
            {showButton ? (
              <div>
                <button
                  className="bg-slate-300 border-2 border-stone-700 mr-1 pl-1 pr-1 hover:bg-cyan-200"
                  type="button"
                >
                  <a
                    href={`https://www.themoviedb.org/tv/82728-bluey/season/${episode_number.substring(
                      1,
                      3
                    )}/episode/${episode_number.substring(4, 6)}?language=en`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    ℹ Info
                  </a>
                </button>
                <button
                  type="button"
                  className="bg-slate-300 border-2 border-stone-700 pl-1 mr-1 pr-1 hover:bg-cyan-200"
                  onClick={(event) =>
                    clipboard(
                      event,
                      `${episode_number.slice(
                        0,
                        -4
                      )} ${episode_name} @ ${frame_time}`
                    )
                  }
                >
                  {copyVal}
                </button>
              </div>
            ) : (
              <p></p>
            )}

            <div className="flex flex-row items-center my-3 whitespace-nowrap pr-5 ">
              <input
                type="text"
                className="px-2  w-full h-9  border-2  border-stone-700"
                placeholder={
                  textDisabled
                    ? "Get new frame?"
                    : "Fuzzy search (3+ characters) or sXXeXX"
                }
                value={inputValue}
                onChange={handleInputChange}
                disabled={textDisabled}
                autoFocus
                ref={inputRef}
              />
              <input
                type="checkbox"
                className="mx-1"
                checked={isChecked}
                onChange={handleCheckboxChange}
              ></input>
              <label>Use synopsis</label>
            </div>
            <div className="overflow-y-auto ">
              {result !== null && result.map !== null && <ul>{episodeList}</ul>}
            </div>
            <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700 mr-4"></hr>
          </div>

          <div className="flex justify-center w-full bg-black align-middle items-center h-80 sm:h-full ">
            {isLoading ? (
              <img
                src="https://www.svgrepo.com/show/315795/spinner.svg"
                alt=""
                className="invert h-28 fill-white absolute animate-spin"
              />
            ) : (
              ""
            )}
            {image && (
              <img
                src={image}
                alt="JPEG Image"
                onLoad={loading}
                className={`${showImage ? "" : "hidden"} `}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
