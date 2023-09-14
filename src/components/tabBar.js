import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { DocumentEditor } from "@onlyoffice/document-editor-react";

function TabBar() {
  const [activeTab, setActiveTab] = useState("editor");
  const [studentConfigData, setStudentConfigData] = useState(null);
  const [solutionConfigData, setSolutionData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [unmatched, setunmatched] = useState();
  const [percent, setpercent] = useState();

  const session_id = "12345";
  const username = "yokesh@gmail.com";
  const password = "vidhai";
  const user = username.split("@");
  const solution = "exercise1";
  let percentage = 0;
  let unmatch = [];
  // const eval_url  = "https://api.vidhai.office.usln.in/evaluate";
  const eval_url = "http://localhost:9005/evaluate";

  useEffect(() => {
    // if (activeTab === 'editor' && !studentConfigData){
      fetchConfigData(
        `http://localhost:3000/editor?fileName=yokesh_question1_student.docx`,
        "student"
      );
    // }
    // if(activeTab === 'solution' && !solutionConfigData){
      fetchConfigData(
        `http://localhost:3000/editor?type=desktop&mode=view&fileName=solution_question1.docx&userid=uid-1&lang=en&directUrl=false`,
        "solution"
      );
    // }
    
  }, []);

  const fetchConfigData = async (url, StudentorSolution) => {
    try {
      console.log("url = ", url);
      const response = await axios.get(url);
      console.log("response = ", response);
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, "text/html");
      const scriptIndex = 1;
      const scriptElements = doc.querySelectorAll("script");
      const scriptElement = scriptElements[scriptIndex];
      const scriptContent = scriptElement.textContent;
      const variableName = "config";
      const regex = new RegExp(`${variableName}\\s*=\\s*({[^;]+});`);
      const match = scriptContent.match(regex);

      if (match && match[1]) {
        try {
          const configObject = JSON.parse(match[1]);
          console.log(configObject);
          StudentorSolution === "student"
            ? setStudentConfigData(configObject)
            : setSolutionData(configObject);
        } catch (error) {
          console.log("Error parsing JSON:", error);
        }
      } else {
        console.log("Variable not found or not properly defined.");
      }
    } catch (error) {
      console.error("Error fetching config data:", error);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const savecopyAs = (event) => {
    console.log("event = ", event);
    var docEditor;

    var innerAlert = function (message, inEditor) {
      if (console && console.log) console.log(message);
      if (inEditor && docEditor) docEditor.showMessage(message);
    };
    console.log("event = ", event);
    var title = event.data.title;
    console.log("saveas - title = ", title);
    var url = event.data.url;
    console.log("save-copyas-url = ", url);
    var data = {
      title: title,
      url: url,
    };
    console.log(data);
    let xhr = new XMLHttpRequest();
    console.log(xhr);
    xhr.open("POST", "http://localhost:3000/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
    xhr.onload = function () {
      innerAlert(xhr.responseText);
      // innerAlert(JSON.parse(xhr.responseText).file, true);
    };
  };

  const EditorTabContent = useMemo(() => {
    if(studentConfigData){
    return (
      <div className="tab-body" style={{ height: "95vh" }}>
        {/* Content for the Editor tab */}
          <DocumentEditor
            id="docxEditor"
            documentServerUrl="http://192.168.1.125:8050"
            config={studentConfigData}
            events_onRequestSaveAs={(event) => {
              console.log("event = ", event);
              //  setSaveAsEvent(event); // Update the event state
              savecopyAs(event);
            }}
          />
      </div>
    );
    }
    return null;
  },[studentConfigData]);

  const SolutionTabContent = useMemo(() => {
    if (solutionConfigData){
    return (
      <div className="tab-body" style={{ height: "95vh" }}>
        {/* Content for the Solution tab */}
        {studentConfigData && (
          <DocumentEditor
            id="docxEditor"
            documentServerUrl="http://192.168.1.125:8050"
            config={solutionConfigData}
          />
        )}
      </div>
    
    );
    }
    return null;
  },[solutionConfigData]);

  const handleEvaluateClick = () => {
    // console.log("e",e);
    // e.preventDefault();
    setShowPopup(!showPopup);
  };

  function evaluate() {
    console.log("evaluation...");

    fetch(eval_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: "yokesh",
        question_id: "question1",
        question_type: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data = ",data);
        setunmatched(data.unmatched);
        percentage = (data.percentage).toFixed(2);
        setpercent(percentage);
  
        handleEvaluateClick();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  return (
    <div>
      <div className="Tabs">
        <button
          id="editorbtn"
          className={`tab ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => handleTabClick("editor")}
        >
          EDITOR
        </button>
        <button
          id="solutionbtn"
          className={`tab ${activeTab === "solution" ? "active" : ""}`}
          onClick={() => handleTabClick("solution")}
        >
          SOLUTION
        </button>
        <button
          id="evaluatebtn"
          className={`tab ${activeTab === "evaluate" ? "active" : ""}`}
          onClick={
            evaluate
            // saveas();
          }
        >
          EVALUATE
        </button>
      </div>
      <div className="tab-content">

        {activeTab === "editor" && EditorTabContent}
        {activeTab === "solution" && SolutionTabContent}
        {/* Popup */}
        {showPopup && (
          <div className="popup" style={{ padding: "10px", borderRadius: "10px" }}>
            {/* Add your popup content here */}
            <h3 style={{ textAlign: "center" }}>RESULT</h3>
            {
              <h3
                style={{
                  color: percent > 60 ? "green" : "red",
                  paddingLeft: "15px",
                }}
              >
                {"Percentage matched = " + percent}
              </h3>
            }
            <div className="popup-content">
             {
              unmatched.map((item, index) => (
                <p key={index} style={{ color: "black" }}>
                  {item}
                </p>
              ))
             }
            </div>
            <div style={{ textAlign: "center", marginTop: "8px", }}>
                <button
                  style={{
                    padding: "8px",
                    width: "70px",
                    textAlign: "center",
                    backgroundColor: "orange",
                    borderRadius: "5px",
                    fontWeight: "bold",
                  }}
                  onClick={handleEvaluateClick}
                >
                  OK
                </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TabBar;
