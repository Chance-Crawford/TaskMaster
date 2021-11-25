
// an object which will be used to save all tasks
// to localStorage for recovery.
// this tasks object will have 4 arrays. The arrays are to do, in progress, etc.
// those arrays will house all TASK OBJECTS based on their status.
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


// jquery ui sortable allows for you to drag elements
// and resort them in other lists, or in the same list.
// in this case we are selecting all of the ui elements like
// the to do list, inprogress list, etc. and are making them sortable.
// sortable in jquery means that all child elements (li) within the
// sortable list can be can be dragged and resorted within the list
$(".card .list-group").sortable({
  // we are allowing the list to connect with
  // any other ul list. This means any items in one list can be sorted into another
  // sortable ul list-group list, since they are connected.
  connectWith: $(".card .list-group"),
  // we are now adding several event listeners based on the state
  // of sorting or dragging.
  scroll: false,
  tolerance: "pointer",
  // tells jQuery to create a copy of the dragged element and move the copy 
  // instead of the original. This is necessary to prevent click events from 
  // accidentally triggering on the original element.
  helper: "clone",
  // The activate and deactivate events trigger once for all connected 
  // lists as soon as dragging starts and stops.
  // Events like activate and over would be great for styling. We could change 
  // the color of elements at each step to let the user know dragging is 
  // working correctly.
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  // The over and out events trigger when a dragged item enters or 
  // leaves a connected list.
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  // The update event triggers when the contents of a list have 
  // changed (e.g., the items were re-ordered, an item was removed, or an 
  // item was added).
  // an updated list signifies the need to re-save tasks in localStorage. 
  // Remember that an update can happen to two lists at once if a task is 
  // dragged from one column to another.
  // In this case when you move a task from one list to another,
  // update will run for both columns individually.
  // for removing the task from one list and placing it in the other,
  // the update will run for each list. Updating and saving the new 
  // list to the localStorage.
  update: function(event) {
    // array to store the task data in after an update.
    // temp array will overwrite whats currently saved in the tasks object.
    var tempArr = [];
    // after update has occured,
    // loop over current set of children (li) in sortable list
    // loop over each child in the list and perform this function.
    // The children() method returns an array of the ul element's, li children
    $(this).children().each(function() {
      // here "this" refers to the child task li element at the current index.
      // find the p element within the current li task, and get the inner text content
      // from the p element.
      // trim any of the whitespace before or after it just in case, 
      // and store it in the variable
      // "text".
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });

    });

    // The next step is to use the tempArr array to overwrite what's currently 
    // saved in the tasks object. We're dealing with multiple lists, though, not 
    // just toDo. How do we know when to update tasks.toDo versus tasks.inReview 
    // or tasks.done?

    // We solved a similar problem earlier in the project when dealing with 
    // blur events. Each list has an id attribute that matches a property on tasks. 
    // For instance: id="list-inReview". We'll use the same approach here to get 
    // the list's ID and update the corresponding array on tasks
    // trim down list's ID to match the name of the array we want 
    // within the tasks object.
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array in tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();


  }

});


// deletes the task when the task is dropped over the red
// delete zone.
// droppable is jquery ui method
// select delete zone, make it droppable.
$("#trash").droppable({
  // Controls which draggable elements are accepted by the droppable.
  // the delete zone will only accept the task elements within the unordered
  // lists. (the tasks are li elements).
  // we made the li elements draggable in the function above.
  // technically we made the ul the tasks are held in sortable, which makes the
  // tasks themselves draggable.
  accept: ".card .list-group-item",
  // Specifies which mode to use for testing whether 
  // a draggable is hovering over a droppable.
  // "touch": Draggable overlaps the droppable any amount.
  // to see more modes look at jquery ui documentation - droppable.
  tolerance: "touch",
  // Triggered when an accepted draggable is dropped on the droppable 
  // (based on the tolerance option).
  // the drop method, in this case, is most important because that 
  // means a user is trying to delete a task.
  drop: function(event, ui) {
    // jQuery UI has a second function parameter, which they've decided to 
    // call ui. This variable is an object that contains a property called 
    // draggable. According to the documentation, draggable is "a jQuery 
    // object representing the draggable element." If that's true, then 
    // we should be able to call DOM methods on it!
    // jQuery's remove() method works just like a regular JavaScript 
    // remove() and will remove that element from the DOM entirely.

    // Now that the task has been removed, do we need to call saveTasks() 
    // again? Surprisingly, no! Removing a task from any of the lists 
    // triggers a sortable update(), it triggers the sortable function 
    // that we defined above, and considers the removal as an "update" 
    // within the function meaning the sortable calls 
    // saveTasks() for us.
    ui.draggable.remove();
  },
  // defined in above function.
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
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


