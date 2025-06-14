export default class QuestionScreen {
  constructor(_parent) {
    this.parent = _parent;
    this.isEditable = false;
    this.questions = [];
    this.selectedQuestionIndex = 0;

    this.deletedQuestions = new Set();
    this.updatedQuestions = new Set();
    this.addedQuestions = new Set();

    // Model Objects
    const urlTokens = window.location.pathname.split("/questions/");

    if (!urlTokens[1] || urlTokens[1].trim() === "") {
      window.location.href = "/";
    }

    this.chaptorPath = urlTokens[1];

    this.questionsUrl = "/api/questions/" + this.chaptorPath;

    this.setupLanguage(urlTokens);

    // eslint-disable-next-line no-undef
    this.questionEditor = new EasyMDE({
      autofocus: true,
      element: document.querySelector("#qTxt"),
    });
    // eslint-disable-next-line no-undef
    this.explanationEditor = new EasyMDE({
      element: document.querySelector("#eTxt"),
    });

    this.answerContainer = document.getElementById("answerContainer");
    this.questionContainer = document.getElementById("questionContainer");
    this.matcheContainer = document.getElementById("matcheContainer");

    document
      .querySelectorAll(".editor-toolbar")
      .forEach((element) => element.classList.add("d-none"));
    document
      .querySelectorAll(".editor-statusbar")
      .forEach((element) => element.classList.add("d-none"));

    this.questionEditor.togglePreview();
    this.explanationEditor.togglePreview();

    this.registerEvents();

    this.loadQuestions();
  }

  setupLanguage(urlTokens) {
    const elements = document.querySelector(
      '[aria-labelledby="languageBtn"]',
    ).children;

    for (let element of elements) {
      if (element.children[0].dataset.code === "en") {
        element.children[0].href = "/questions/" + this.chaptorPath;
      } else {
        element.children[0].href =
          "/" +
          element.children[0].dataset.code +
          "/questions/" +
          this.chaptorPath;
      }
    }

    if (urlTokens[0] !== "") {
      const languageCode = urlTokens[0].substring(1);
      window.LANGUAGE = languageCode;

      for (let element of elements) {
        if (languageCode === element.children[0].dataset.code) {
          console.log(element.children[0]);

          document.getElementById("languageBtn").textContent =
            element.children[0].textContent;

          element.children[0].textContent = "English";
          element.children[0].setAttribute(
            "href",
            "/questions/" + this.chaptorPath,
          );

          break;
        }
      }
    }
  }

  registerEvents() {
    const explainToggleBtn = document.getElementById("explainToggle");
    const explanationContainer = document.getElementById(
      "explanationContainer",
    );

    explainToggleBtn.addEventListener("click", () => {
      if (this.answerContainer.classList.contains("d-none")) {
        explanationContainer.classList.add("d-none");
        this.answerContainer.classList.remove("d-none");
        explainToggleBtn.classList.add("btn-outline-primary");
        explainToggleBtn.classList.remove("btn-primary");
      } else {
        explanationContainer.classList.remove("d-none");
        this.answerContainer.classList.add("d-none");
        explainToggleBtn.classList.remove("btn-outline-primary");
        explainToggleBtn.classList.add("btn-primary");
      }
    });

    document
      .querySelector(".add-btns")
      .childNodes.forEach((element) =>
        element.addEventListener("click", (event) =>
          this.createQuestion(event),
        ),
      );

    document
      .querySelector("i.fa-pencil")
      .parentElement.addEventListener("click", () => {
        this.toggleEditor();
      });

    document
      .querySelector("i.fa-check")
      .parentElement.addEventListener("click", () => {
        this.answer();
      });

    document
      .querySelector("i.fa-floppy-disk")
      .parentElement.addEventListener("click", () => {
        this.save();
      });
    document
      .querySelector("i.fa-trash-alt")
      .parentElement.addEventListener("on-confirmation", () => this.delete());

    this.previousBtn = document.querySelector('[aria-label="Previous"]');

    if (this.previousBtn) {
      this.previousBtn.addEventListener("click", () => {
        this.previous();
      });
    }

    this.nextBtn = document.querySelector('[aria-label="Next"]');

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => {
        this.next();
      });
    }
  }

  createQuestion(event) {
    const newQuestion = {
      question: "",
      explanation: "",
      type: event.currentTarget.dataset.type,
    };
    this.questions.push(newQuestion);
    this.selectedQuestionIndex = this.questions.length - 1;
    this.addedQuestions.add(newQuestion);
    this.setCurrentQuestion();
  }

  save() {
    if (this.getQuestion()) {
      console.log("Save");
      const promises = [];
      this.deletedQuestions.forEach((question) => {
        promises.push(
          fetch("/api/questions/" + question.type + "/" + question.id, {
            method: "DELETE",
            headers: window.ApplicationHeader(),
          }),
        );
      });

      this.updatedQuestions.forEach((question) => {
        promises.push(
          fetch("/api/questions/" + question.type + "/" + question.id, {
            method: "PUT",
            headers: window.ApplicationHeader(),
            body: JSON.stringify(question),
          }),
        );
      });

      this.addedQuestions.forEach((question) => {
        promises.push(
          fetch("/api/questions/" + question.type + "/" + this.chaptorPath, {
            method: "POST",
            headers: window.ApplicationHeader(),
            body: JSON.stringify(question),
          }),
        );
      });

      // eslint-disable-next-line no-undef
      Promise.allSettled(promises).then(() => {
        window.success("Questions Saved Successfully");
        this.loadQuestions();
      });
    }
  }

  loadQuestions() {
    fetch(this.questionsUrl, {
      headers: window.ApplicationHeader(),
    })
      .then((response) => {
        // Shorthand to check for an HTTP 2xx response status.
        // See https://fetch.spec.whatwg.org/#dom-response-ok
        if (response.ok) {
          if (response.status === 204) {
            this.questions = [];
          }
          return response.json();
        } else {
          // Raise an exception to reject the promise and trigger the outer .catch() handler.
          // By default, an error response status (4xx, 5xx) does NOT cause the promise to reject!
          throw Error(response.statusText);
        }
      })
      .then((data) => {
        this.setQuestions(window.shuffle(data));
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  toggleEditor(intial = false) {
    this.isEditable = !this.isEditable;

    if (!intial) {
      this.setCurrentQuestion();
    }

    this.questionEditor.togglePreview();
    this.explanationEditor.togglePreview();

    const icon = document.getElementById("toggleViewBtn").firstChild;
    const saveBtn = document.querySelector(".fa-floppy-disk").parentElement;
    const addBtn = document.querySelector(".fa-plus").parentElement;
    const deleteBtn = document.querySelector(".fa-trash-alt").parentElement;

    const verifyBtn = document.querySelector(".fa-check").parentElement;

    if (this.isEditable) {
      icon.classList.add("fa-regular", "fa-eye");
      icon.classList.remove("fa-solid", "fa-pencil");

      saveBtn.classList.remove("d-none");
      addBtn.classList.remove("d-none");
      deleteBtn.classList.remove("d-none");

      verifyBtn.classList.add("d-none");

      document
        .querySelectorAll(".editor-toolbar")
        .forEach((element) => element.classList.remove("d-none"));
      document
        .querySelectorAll(".editor-statusbar")
        .forEach((element) => element.classList.remove("d-none"));
    } else {
      icon.classList.remove("fa-regular", "fa-eye");
      icon.classList.add("fa-solid", "fa-pencil");

      saveBtn.classList.add("d-none");
      addBtn.classList.add("d-none");
      deleteBtn.classList.add("d-none");

      verifyBtn.classList.remove("d-none");

      document
        .querySelectorAll(".editor-toolbar")
        .forEach((element) => element.classList.add("d-none"));
      document
        .querySelectorAll(".editor-statusbar")
        .forEach((element) => element.classList.add("d-none"));
    }
  }

  setQuestions(questions) {
    this.questions = questions;
    this.selectedQuestionIndex = 0;
    this.setCurrentQuestion();
  }

  delete() {
    const indexTobeDeleted = this.selectedQuestionIndex;

    const questionId = this.questions[indexTobeDeleted].id;

    this.updatedQuestions.forEach((question) => {
      if (question.id === questionId) {
        this.updatedQuestions.delete(question);
      }
    });

    this.deletedQuestions.add(this.questions[indexTobeDeleted]);

    // Last Element. Go to First
    if (indexTobeDeleted === this.questions.length - 1) {
      this.selectedQuestionIndex = 0;
    }

    this.questions.splice(indexTobeDeleted, 1);

    this.setCurrentQuestion();
  }

  previous() {
    if (this.getQuestion()) {
      this.selectedQuestionIndex = this.selectedQuestionIndex - 1;
      this.setCurrentQuestion();
    }
  }

  next() {
    if (this.getQuestion()) {
      this.selectedQuestionIndex = this.selectedQuestionIndex + 1;
      this.setCurrentQuestion();
    }
  }

  setCurrentQuestion() {
    if (this.questions[this.selectedQuestionIndex]) {
      document.getElementById("questionPane").classList.remove("d-none");
      document.getElementById("emptyPane").classList.add("d-none");
      document.getElementById("navPane").classList.remove("invisible");

      document
        .getElementById("actionsPane")
        .querySelectorAll("i")
        .forEach((element) => {
          if (!element.classList.contains("fa-plus")) {
            element.classList.remove("d-none");
          }
        });

      this.setQuestion(this.questions[this.selectedQuestionIndex]);

      if (this.selectedQuestionIndex === this.questions.length - 1) {
        this.nextBtn.parentElement.classList.add("disabled");
      } else {
        this.nextBtn.parentElement.classList.remove("disabled");
      }

      if (this.selectedQuestionIndex === 0) {
        this.previousBtn.parentElement.classList.add("disabled");
      } else {
        this.previousBtn.parentElement.classList.remove("disabled");
      }
    } else {
      document.getElementById("questionPane").classList.add("d-none");
      document.getElementById("emptyPane").classList.remove("d-none");

      document.getElementById("navPane").classList.add("invisible");

      document
        .getElementById("actionsPane")
        .querySelectorAll("i")
        .forEach((element) => {
          if (!element.classList.contains("fa-plus")) {
            element.classList.add("d-none");
          }
        });

      this.toggleEditor(true);
    }
  }

  answer() {
    const selectedQuestion = this.questions[this.selectedQuestionIndex];
    let selectedCheckBoxes, answers;
    let answerText;
    switch (selectedQuestion.type) {
      case "CHOOSE_THE_BEST":
      case "MULTI_CHOICE":
        selectedCheckBoxes = document.querySelectorAll("input");
        answers = [];
        selectedCheckBoxes.forEach((input) => {
          input.parentElement.parentElement.classList.remove("bg-success");
          input.parentElement.parentElement.classList.remove("bg-danger");
          if (input.checked) {
            answers.push(input.value);
          }
        });

        if (answers.length === 0) {
          window.error("Please Select Answer");
        } else {
          answerText = answers.join(",");
        }

        break;

      case "MATCH_THE_FOLLOWING":
        answers = [];

        // eslint-disable-next-line no-case-declarations
        const matches = [];

        // eslint-disable-next-line no-case-declarations
        const matchboxes = this.answerContainer.querySelectorAll(".form-check");
        this.matcheContainer
          .querySelectorAll(".form-check")
          .forEach((item, index) => {
            answers.push(item.attributes["data-id"].value);

            matches.push(matchboxes[index].attributes["data-id"].value);
          });
        answers.push(matches);
        if (answers.length === 0) {
          window.error("Please Select Answer");
        } else {
          answerText = answers.join(",");
        }

        break;
    }
    fetch("/api/questions/" + selectedQuestion.id + "/answer", {
      method: "POST",
      headers: window.ApplicationHeader(),
      body: answerText,
    })
      .then((response) => {
        // Shorthand to check for an HTTP 2xx response status.
        // See https://fetch.spec.whatwg.org/#dom-response-ok
        if (response.ok) {
          if (selectedCheckBoxes) {
            selectedCheckBoxes.forEach((input) => {
              if (input.checked) {
                input.parentElement.parentElement.classList.add("bg-success");
              }
            });
          } else {
            this.answerContainer
              .querySelectorAll("ul>li")
              .forEach((element) => {
                element.classList.remove("bg-danger");
                element.classList.add("bg-success");
              });
          }
        } else if (response.status === 406) {
          if (selectedCheckBoxes) {
            selectedCheckBoxes.forEach((input) => {
              if (input.checked) {
                input.parentElement.parentElement.classList.add("bg-danger");
              }
            });
          } else {
            this.answerContainer
              .querySelectorAll("ul>li")
              .forEach((element) => {
                element.classList.remove("bg-success");
                element.classList.add("bg-danger");
              });
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  getQuestion() {
    if (this.isEditable) {
      const selectedQuestion = this.questions[this.selectedQuestionIndex];
      if (selectedQuestion && this.isValid()) {
        let isChanged = false;
        if (selectedQuestion.question !== this.questionEditor.value()) {
          selectedQuestion.question = this.questionEditor.value();
          isChanged = true;
        }
        if (selectedQuestion.explanation !== this.explanationEditor.value()) {
          selectedQuestion.explanation = this.explanationEditor.value();
          isChanged = true;
        }
        // Weset Choices to the Selected Question
        if (selectedQuestion.choices) {
          selectedQuestion.choices.forEach((choice) => {
            // There is New Choice
            if (!choice.id) {
              isChanged = true;
            }
          });
        }

        if (isChanged) {
          this.markUpdated(selectedQuestion);
        }
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  isValid() {
    let isVal = true;
    const selectedQuestion = this.questions[this.selectedQuestionIndex];
    const selectedChoices = selectedQuestion.choices.filter(
      (choice) => choice.answer,
    );

    if (this.questionEditor.value().trim() === "") {
      window.error("Please Enter Question");
      isVal = false;
    }

    if (selectedChoices.length === 0) {
      window.error("Please select an answer");
      isVal = false;
    }
    return isVal;
  }

  setQuestion(selectedQuestion) {
    this.questionContainer.classList.remove("d-none");
    this.matcheContainer.classList.add("d-none");
    this.questionEditor.value(
      selectedQuestion.question ? selectedQuestion.question : "",
    );
    this.explanationEditor.value(
      selectedQuestion.explanation ? selectedQuestion.explanation : "",
    );

    switch (selectedQuestion.type) {
      case "CHOOSE_THE_BEST":
        this.setChoices(
          true,
          selectedQuestion,
          "choices",
          this.answerContainer,
        );
        break;
      case "MULTI_CHOICE":
        this.setChoices(
          false,
          selectedQuestion,
          "choices",
          this.answerContainer,
        );
        break;
      case "MATCH_THE_FOLLOWING":
        this.setChoices(
          false,
          selectedQuestion,
          "choices",
          this.matcheContainer,
          true,
        );
        this.setChoices(
          false,
          selectedQuestion,
          "matches",
          this.answerContainer,
        );

        this.matcheContainer
          .querySelectorAll("input[type='checkbox'")
          .forEach((checkbox) => {
            checkbox.classList.add("d-none");
            checkbox.parentElement.innerHTML =
              checkbox.nextElementSibling.innerHTML;
          });
        this.answerContainer
          .querySelectorAll("input[type='checkbox'")
          .forEach((checkbox) => {
            const shiftIcons = document.createElement("span");

            shiftIcons.innerHTML = `<span class="badge text-dark rounded-pill justify-content-start"><i class="fa-solid fa-arrow-up px-2"></i><i
    class="fa-solid fa-arrow-down"></i></span>`;

            checkbox.classList.add("d-none");
            const parentElement = checkbox.parentElement.parentElement;
            checkbox.parentElement.innerHTML =
              checkbox.nextElementSibling.innerHTML;
            parentElement.insertBefore(shiftIcons, parentElement.firstChild);

            shiftIcons
              .querySelector("i.fa-arrow-up")
              .addEventListener("click", (event) => {
                const liEl =
                  event.currentTarget.parentElement.parentElement.parentElement;

                if (liEl.parentElement.firstChild === liEl) {
                  liEl.parentNode.insertAfter(liEl, liEl.parentNode.lastChild);
                } else {
                  liEl.parentNode.insertBefore(
                    liEl,
                    liEl.previousElementSibling,
                  );
                }
              });

            shiftIcons
              .querySelector("i.fa-arrow-down")
              .addEventListener("click", (event) => {
                const liEl =
                  event.currentTarget.parentElement.parentElement.parentElement;

                const ulNode = liEl.parentNode;

                if (liEl.parentElement.lastChild === liEl) {
                  ulNode.insertBefore(liEl, ulNode.firstChild);
                } else {
                  liEl.parentNode.insertBefore(
                    liEl,
                    liEl.nextElementSibling.nextElementSibling,
                  );
                }
              });
          });
        this.questionContainer.classList.add("d-none");
        this.matcheContainer.classList.remove("d-none");
        break;
    }
  }

  setChoices(
    isSingle,
    selectedQuestion,
    propertyName,
    theContainer,
    skipShuffle,
  ) {
    theContainer.innerHTML = `<ul class="list-group">

    ${
      this.isEditable
        ? `<li class="list-group-item">
        <input class="form-control me-2" type="search" placeholder="Add New Choice. Press Enter" aria-label="Add New Choice">
        </li>`
        : ``
    }
  </ul>`;

    if (selectedQuestion[propertyName]) {
      if (!skipShuffle) {
        window.shuffle(selectedQuestion[propertyName]);
      }
    } else {
      selectedQuestion[propertyName] = [];
    }

    selectedQuestion[propertyName].forEach((choice) => {
      this.setChoice(isSingle, choice, theContainer, propertyName);
    });

    if (this.isEditable) {
      theContainer
        .querySelector(".form-control")
        .addEventListener("keyup", (event) => {
          if (event.keyCode === 13) {
            event.preventDefault();
            if (event.currentTarget.value !== "") {
              const choice = {
                cValue: event.currentTarget.value,
              };
              selectedQuestion[propertyName].push(choice);
              event.currentTarget.value = "";
              this.setChoice(isSingle, choice, theContainer, propertyName);
            }
          }
        });
    }
  }

  setChoice(isSingle, choice, theContainer, propertyName) {
    const ulEl = theContainer.firstElementChild;
    const liEl = document.createElement("li");
    liEl.classList.add("list-group-item");
    liEl.classList.add("d-flex");
    liEl.classList.add("align-items-center");
    liEl.innerHTML = `<div class="form-check" data-id="${choice.id}">
  <input class="form-check-input" type="${isSingle ? "radio" : "checkbox"}" ${
    this.isEditable && choice.answer ? "checked" : ""
  }
    name="flexRadioDefault" value="${choice.id}" id="flexCheckDefault">
  <label class="form-check-label" for="flexCheckDefault">

  </label>
</div>
${
  this.isEditable
    ? `<span class="badge text-dark rounded-pill justify-content-end"><i class="fa-solid fa-pen px-2"></i><i
    class="far fa-trash-alt" data-bs-toggle="modal" data-bs-target="#exampleModal"></i></span>`
    : ``
}




`;
    ulEl.appendChild(liEl);

    if (this.isEditable) {
      liEl
        .querySelector("input.form-check-input")
        .addEventListener("change", (event) => {
          if (isSingle) {
            const selectedQuestion = this.questions[this.selectedQuestionIndex];
            if (selectedQuestion[propertyName]) {
              selectedQuestion[propertyName].forEach((choice) => {
                delete choice.answer;
              });
            }
          }
          choice.answer = event.currentTarget.checked;
        });

      liEl
        .querySelector(".fa-pen")
        .addEventListener("click", (event) => this.editChoice(event));
      liEl
        .querySelector(".fa-trash-alt")
        .addEventListener("on-confirmation", (event) =>
          this.removeChoice(event),
        );
    }

    liEl.firstElementChild.children[1].innerHTML = choice.cValue;
    return liEl;
  }

  editChoice(event) {
    const selectedQuestion = this.questions[this.selectedQuestionIndex];
    const parentLiEl = event.currentTarget.parentElement.parentElement;

    const choiceIndex =
      Array.from(parentLiEl.parentNode.children).indexOf(parentLiEl) - 1;

    const label = parentLiEl.children[0].children[1];
    const eOptions = event.currentTarget.parentElement;

    const textToEdit = document.createElement("input");
    textToEdit.classList.add("form-control");
    textToEdit.classList.add("me-2");
    textToEdit.value = label.innerHTML;

    label.classList.add("d-none");
    eOptions.classList.add("d-none");

    parentLiEl.children[0].insertBefore(textToEdit, label);

    textToEdit.focus();
    textToEdit.select();

    const afterSubmit = () => {
      textToEdit.parentElement.removeChild(textToEdit);
      if (textToEdit.value !== selectedQuestion.choices[choiceIndex].value) {
        label.innerHTML = textToEdit.value;
        selectedQuestion.choices[choiceIndex].value = textToEdit.value;
        this.markUpdated(selectedQuestion);
      }
      label.classList.remove("d-none");
      eOptions.classList.remove("d-none");
    };

    textToEdit.addEventListener("focusout", afterSubmit);

    textToEdit.addEventListener("keydown", (event) => {
      if (event.isComposing || event.key === "Enter") {
        afterSubmit(event);
      }
    });
  }

  markUpdated(selectedQuestion) {
    if (selectedQuestion.id) {
      this.updatedQuestions.add(selectedQuestion);
    }
  }

  removeChoice(event) {
    const selectedQuestion = this.questions[this.selectedQuestionIndex];
    const parentLiEl = event.currentTarget.parentElement.parentElement;

    const choiceIndex =
      Array.from(parentLiEl.parentNode.children).indexOf(parentLiEl) - 1;
    this.markUpdated(selectedQuestion);

    selectedQuestion.choices.splice(choiceIndex, 1);
    parentLiEl.parentElement.removeChild(parentLiEl);
  }
}
