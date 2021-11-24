var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create new elements that make up a task item
  // to create an element you use brackets <li>. to select an existing element
  // yo dont use brackets li.
  var taskLi = $("<li>").addClass("list-group-item");

  // jQuery methods can be chained together like this
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);

  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to new li parent
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

// reloads all tasks from localStorage and
// puts them back on the screen
var loadTasks = function() {
  // loads all task objects from localStorage
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};



// event delegation.
// see google docs third party apis - notes, jQuery selectors
// selects the ul element (one that shows all the tasks).
// check if a <p> child element within this ul parent element (.list-group)
// was clicked. If it was, run this function.
$(".list-group").on("click", "p", function() {
  // select "this" p element
  // get it's inner text content and trim it, removing
  // any extra white space before or after
  var text = $(this)
    .text()
    .trim();

  // create new textarea element
  // add a class and set the value (whats written inside the textarea)
  // to the inner text to the variable text from above.
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  // swap out the existing p element that was clicked 
  // with the new textarea element we just created.
  $(this).replaceWith(textInput);

  // this works but now the user has to click on the <textarea> to begin 
  // editing. A better experience would be to automatically highlight 
  // the input box for them. A highlighted element is considered in focus, 
  // an event that can also be triggered programmatically.
  textInput.trigger("focus");

  // function to save it is below
});

// saves what the user put in the textarea from function
// above.
// This blur event will trigger as soon as the user interacts 
// with anything other than the <textarea> element 
// (when user clicks off and textarea comes out of focus)
$(".list-group").on("blur", "textarea", function() {
  // when this happens we need to collect some data so
  // we know which task to update

  // get the textarea's current value/text inside, trim so no
  // white space before or after.
  var text = $(this)
  .val()
  .trim();

  // get the parent ul's id attribute
  // we get the parent by getting closest ul.
  // Note that .replace(), in the status variable initialization, isn't actually a 
  // jQuery method. It's a regular JavaScript operator to find and replace text in a 
  // string. We can, in fact, chain jQuery and JavaScript operators together in 
  // our operations, which is great. Here, we're chaining it to attr(), 
  // which is returning the ID, which will be "list-" followed by the 
  // category. We're then chaining that to .replace() to remove "list-" 
  // from the text, which will give us the category name (e.g., "toDo") that will 
  // match one of the arrays on the tasks object (e.g., tasks.toDo). 
  // If the user edited the first to-do in the list, these three variables 
  // could look something like this:
  // text = "Walk the dog";
  // status = "toDo";
  // index = 0;
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // We'd want to update the overarching tasks object with the new data. 
  // If we knew the values ahead of time, we could write the following:
  // tasks.toDo[0].text = "Walk the dog";
  // Because we don't know the values, we'll have to use the variable 
  // names as placeholders. Underneath the three variables, 
  // add the following lines:
  // tasks[status][index].text = text;
  // saveTasks();
  // Let's digest this one step at a time:

  //tasks is an object.

  //tasks[status] returns an array (e.g., toDo).

  // tasks[status][index] returns the object at the given index in the array.

  // tasks[status][index].text returns the text property of the object at the 
  // given index.

  // we change text property of object to new value user
  // put inside of the textarea element.

  // Updating this tasks object was necessary for localStorage, so 
  // we call saveTasks() immediately afterwards.
  tasks[status][index].text = text;
  saveTasks();

  // Now we just need to convert the <textarea> back into a <p> element.
  // recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);


});


// same as above listeners, only this time with due dates
// above has more comments so see those.
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
  // In jQuery, attr() can serve two purposes. With one argument, 
  // it gets an attribute (e.g., attr("id")). With two arguments, 
  // it sets an attribute (e.g., attr("type", "text")). 
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");

  // see below for saving process
});


// same as above listeners, only this time with due dates
// above has more comments so see those.
// value of due date was changed
// selecting child <input> of ul with attribute selector.
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text inside input
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the li task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // in the tasks array, get the desired status array (ex. toDo)
  // in the status array, get the specific li object we want.
  // then get that li object's date property, and change it
  // to the updated date.
  // update task object in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});





// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


