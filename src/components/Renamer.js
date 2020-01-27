// TODO: use CTA to explain app usage

import React from "react";
import axios from "axios";
import Select from "react-select";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import firebase from "../constants/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleDown, faSync } from "@fortawesome/free-solid-svg-icons";
import { delay } from "q";

class Renamer extends React.Component {
  state = {
    modules: [],
    courses: [],
    selectedCourse: null,
    apiKey: "",
    success: false,
    longNames: [],
    error: null,
    loading: false,
    loadMessage: null,
    skipNumbering: false,
    location: null,
    courseName: null,
    startingNumber: 1,
    removeNumbering: false
  };

  changeState = e => {
    const { value, name } = e.target;
    this.setState({
      [name]: value
    });
  };

  changeTitle = e => {
    const { name: index, value } = e.target;
    const { modules } = this.state;
    modules[index].new_title = value;
    this.setState({
      modules
    });
  };

  requestCourses = async e => {
    e.preventDefault();
    await this.setState({
      loading: true
    });
    let { apiKey } = this.state;
    apiKey.replace(" ", "");
    if (apiKey.length > 0) {
      await axios({
        method: "GET",
        url: "/api/courses",
        params: {
          apiKey
        }
      })
        .then(res => {
          const courses = res.data.data;
          this.setState({
            courses,
            loading: false,
            error: null
          });
          if (courses.length === 0) {
            this.setState({
              loading: false,
              error: `You do not have any courses to display!`
            });
          }
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      this.setState({
        error: `You did not provide an API key.`,
        loading: false
      });
    }
  };

  omitNumbering = () => {
    const { skipNumbering } = this.state;
    this.setState({
      skipNumbering: !skipNumbering
    });
  };

  deleteNumbers = () => {
    const { removeNumbering } = this.state;
    this.setState({
      removeNumbering: !removeNumbering
    });
  };

  pullModules = async e => {
    await this.setState({
      success: false,
      loading: true
    });
    const courseId = e.value;
    const courseName = e.label;
    const { apiKey } = this.state;
    await axios({
      method: "GET",
      url: `/api/modules`,
      params: {
        apiKey,
        courseId
      }
    })
      .then(res => {
        const json = res.data.data;

        const checkForResources = () => {
          const resourcesIndex = json.findIndex(
            module => module.name === "Resources"
          );

          if (resourcesIndex !== -1) {
            json.splice(resourcesIndex, 1);
            checkForResources();
          }
        };

        checkForResources();

        const teacherIndex = json.findIndex(
          module =>
            module.name ===
            "Teacher Resources: How to teach and implement an eDL course successfully"
        );

        if (teacherIndex !== -1) {
          json.splice(teacherIndex, 1);
        }

        const introIndex = json.findIndex(
          module => module.name === "Getting Started: For students"
        );
        if (introIndex !== -1) {
          json.splice(introIndex, 1);
        }

        const introTwo = json.findIndex(
          module => module.name === "Getting Started"
        );

        if (introTwo !== -1) {
          json.splice(introTwo, 1);
        }

        const infoIndex = json.findIndex(
          module => module.name === "Course Information"
        );

        if (infoIndex !== -1) {
          json.splice(infoIndex, 1);
        }

        this.setModuleNames(json);

        this.setState({
          selectedCourse: courseId,
          courseName,
          loading: false
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  refreshCourse = async e => {
    e.preventDefault();
    await this.setState({
      success: false,
      loading: true
    });
    const { apiKey, selectedCourse: courseId, courseName } = this.state;
    console.log(courseId);
    await axios({
      method: "GET",
      url: `/api/modules`,
      params: {
        apiKey,
        courseId
      }
    })
      .then(res => {
        const json = res.data.data;

        const checkForResources = () => {
          const resourcesIndex = json.findIndex(
            module => module.name === "Resources"
          );

          if (resourcesIndex !== -1) {
            json.splice(resourcesIndex, 1);
            checkForResources();
          }
        };

        checkForResources();

        const teacherIndex = json.findIndex(
          module =>
            module.name ===
            "Teacher Resources: How to teach and implement an eDL course successfully"
        );

        if (teacherIndex !== -1) {
          json.splice(teacherIndex, 1);
        }

        const introIndex = json.findIndex(
          module => module.name === "Getting Started: For students"
        );
        if (introIndex !== -1) {
          json.splice(introIndex, 1);
        }

        const introTwo = json.findIndex(
          module => module.name === "Getting Started"
        );

        if (introTwo !== -1) {
          json.splice(introTwo, 1);
        }

        const infoIndex = json.findIndex(
          module => module.name === "Course Information"
        );

        if (infoIndex !== -1) {
          json.splice(infoIndex, 1);
        }

        this.setModuleNames(json);

        this.setState({
          selectedCourse: courseId,
          courseName,
          loading: false
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  setModuleNames = json => {
    const modules = [];
    let chapterNumber = Number(this.state.startingNumber);
    const { skipNumbering, removeNumbering } = this.state;
    json.forEach(module => {
      module.position = chapterNumber;
      chapterNumber = chapterNumber + 1;

      module.items.forEach((item, index) => {
        item.module_name = module.name;
        if (removeNumbering) {
          const firstLetterIndex = item.title.search(/[A-Za-z]/g);
          item.title = item.title.substr(
            firstLetterIndex,
            item.title.length - 1
          );
          console.log(item.title);
        }
        if (!skipNumbering) {
          if (index < 9 && module.items.length < 100) {
            if (json.length > 9 && module.position < 10) {
              item.new_title = `0${module.position}.0${index + 1} - ${
                item.title
              }`;
            } else {
              item.new_title = `${module.position}.0${index + 1} - ${
                item.title
              }`;
            }
          } else if (index < 9 && module.items.length > 99) {
            if (json.length > 9 && module.position < 10) {
              item.new_title = `0${module.position}.00${index + 1} - ${
                item.title
              }`;
            } else {
              item.new_title = `${module.position}.00${index + 1} - ${
                item.title
              }`;
            }
          } else if (index > 8 && index < 99 && module.items.length > 99) {
            if (json.length > 9 && module.position < 10) {
              item.new_title = `0${module.position}.0${index + 1} - ${
                item.title
              }`;
            } else {
              item.new_title = `${module.position}.0${index + 1} - ${
                item.title
              }`;
            }
          } else {
            if (json.length > 9 && module.position < 10) {
              item.new_title = `0${module.position}.${index + 1} - ${
                item.title
              }`;
            } else {
              item.new_title = `${module.position}.${index + 1} - ${
                item.title
              }`;
            }
          }
        } else {
          item.new_title = item.title;
        }
        modules.push(item);
      });
    });
    this.setState({
      modules
    });
  };

  submitNames = async e => {
    const dbRef = firebase.database().ref("/");
    e.preventDefault();
    const {
      modules,
      apiKey,
      selectedCourse: courseId,
      location,
      courseName
    } = this.state;
    this.setState({
      error: null,
      longNames: []
    });
    // Start long name check.
    const longNames = [];
    await modules.forEach(module => {
      if (module.new_title.length > 50) {
        if (
          module.type === "Assignment" ||
          module.type === "Quiz" ||
          module.type === "Discussion"
        ) {
          longNames.push(module.new_title);
        }
      }
    });
    if (longNames.length === 0) {
      await this.setState({
        error: null,
        success: false,
        loading: true,
        loadMessage: `Please wait while the items are renamed. This may take 1-2 minutes.`
      });
      let error = false;

      async function putRequest() {
        for (let i = 0; i < modules.length; i++) {
          if (!error) {
            if (modules[i].new_title.length > 0) {
              await axios({
                method: "PUT",
                url: encodeURI(`/api/item`),
                data: {
                  apiKey,
                  newTitle: modules[i].new_title,
                  moduleId: modules[i].module_id,
                  itemId: modules[i].id,
                  courseId
                }
              })
                .then(res => {
                  const post = {
                    oldTitle: modules[i].title,
                    newTitle: modules[i].new_title,
                    apiKey,
                    location,
                    course: courseId,
                    module: modules[i].module_id,
                    courseName,
                    item: modules[i].id,
                    dateChanged: Date.now()
                  };
                  dbRef.push(post);
                  console.log(res);
                })
                .catch(e => {
                  error = true;
                  console.log(e);
                });
            }
            await delay(1000);
          }
        }
      }
      await putRequest();
      if (!error) {
        this.setState({
          success: true,
          error: null,
          loading: false,
          modules: [],
          newModuleNames: []
        });
      } else {
        this.setState({
          error: `The request did not go through.`,
          loading: false
        });
      }
    } else {
      this.setState({
        error: `Some names are too long. Please correct the following names:`,
        longNames
      });
    }
  };

  render() {
    return (
      <div className="renamer">
        <Helmet>
          <title>Course Module Name Changer</title>
        </Helmet>
        <Link to="/tracker">Go to change tracker >></Link>
        <h1>Course Module Name Changer</h1>
        <form onSubmit={this.requestCourses}>
          <fieldset aria-busy={this.state.loading}>
            <label htmlFor="apiKey">
              Input your API Key:
              <input
                type="text"
                name="apiKey"
                value={this.state.apiKey}
                onChange={this.changeState}
                disabled={this.state.courses.length > 0}
              />
            </label>
            <button type="submit">
              <FontAwesomeIcon icon={faAngleDoubleDown} /> Get Courses
            </button>
          </fieldset>
        </form>
        {this.state.courses.length > 0 && (
          <>
            <div className="options">
              <input
                type="checkbox"
                name="skipNumbering"
                onChange={this.omitNumbering}
                value={this.state.skipNumbering}
              />
              <label htmlFor="skipNumbering">Skip automated numbering.</label>
              <input
                type="checkbox"
                name="removeNumbering"
                onChange={this.deleteNumbers}
                value={this.state.removeNumbering}
              />
              <label htmlFor="removeNumbering">
                Remove existing numbering.
              </label>
            </div>
            <div className="options">
              <label htmlFor="startingNumber">Starting Chapter Number:</label>
              <input
                type="number"
                name="startingNumber"
                value={this.state.startingNumber}
                onChange={this.changeState}
              />
              <button onClick={this.refreshCourse}>
                <FontAwesomeIcon icon={faSync} /> Refresh Course
              </button>
            </div>
            <Select
              options={this.state.courses.map(course => {
                return {
                  value: course.id,
                  label: course.course_code
                };
              })}
              onChange={this.pullModules}
            />
          </>
        )}
        {this.state.selectedCourse && (
          <p className="course-id">
            <span>Here's the course ID. Copy and paste it if needed:</span>
            {this.state.selectedCourse}
          </p>
        )}
        {this.state.loading && (
          <p>{this.state.loadMessage || `Loading, please wait.`}</p>
        )}
        {this.state.error && (
          <div className="error-container">
            <p className="error">
              <span>Error:</span> {this.state.error}
            </p>
            {this.state.longNames.length > 0 && (
              <ul>
                {this.state.longNames.map(name => (
                  <li>
                    {name} ({name.length} characters)
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {this.state.success && (
          <p className="success">
            <span>Congratulations:</span> Module names successfully updated!
          </p>
        )}
        {this.state.modules.length > 0 && (
          <>
            <p>
              Here are the items with new names, please check them and change
              manually if necessary. Any assignment, quiz, or discussion with
              over 50 characters in the title MUST be renamed.
            </p>
            <p>
              <span className="notice">Note:</span> You CANNOT use any special
              characters (including &) in your names.
            </p>
            <div className="grid-container">
              <div className="grid-header">Old Name</div>
              <div className="grid-header">New Name</div>
              <div className="grid-header"># Characters</div>
              {this.state.modules.map((module, index) => {
                return (
                  <React.Fragment key={index}>
                    <div>{module.title}</div>
                    <div>
                      <input
                        type="text"
                        onChange={this.changeTitle}
                        name={index}
                        value={module.new_title}
                      />
                    </div>
                    <div>
                      {module.new_title.length > 50 &&
                      module.type === "Assignment" ? (
                        <span className="long-name">
                          {module.new_title.length}
                        </span>
                      ) : module.new_title.length > 50 &&
                        module.type === "Quiz" ? (
                        <span className="long-name">
                          {module.new_title.length}
                        </span>
                      ) : module.new_title.length > 50 &&
                        module.type === "Discussion" ? (
                        <span className="long-name">
                          {module.new_title.length}
                        </span>
                      ) : (
                        module.new_title.length
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <button onClick={this.submitNames}>Save Names</button>
          </>
        )}
      </div>
    );
  }
}

export default Renamer;
