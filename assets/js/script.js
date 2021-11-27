
// an object which will be used to save all tasks
// to localStorage for recovery.
// this tasks object will have 4 arrays. The arrays are to do, in progress, etc.
// those arrays will house all TASK OBJECTS based on their status.
var tasks = {};


// When we create a task or edit its due date, we want to be able to 
// see if that date is either in the past or within two days from now. 
// If it's in the past, we'll add a red background to the task item to let 
// the user know it's overdue. If it's within the next two days, we'll add a 
// yellow background to it. 

// Because we need to run this type of functionality in the functions for 
// both creating tasks and editing task due dates, we should create a separate 
// function for it, called auditTask, and set it up to accept the task's 
// <li> element as a parameter. This way we can add classes to it if need be. 

// since the tasks are saved and recreated whenever the page is reloaded,
// the tasks will pass through the createTask() function on reload,
// which also means they will pass through this function, since this function is 
// called within createTasks(). So on reload, the color of the background of the
// tasks will change based on their new status, overdue, near due date, or normal.

// Edit: we also triggered this event to occur whenever the span element is changed
// in a the $(".list-group").on("change", "input[type='text']", function()
// further below, so a reload is no longer required.
// this function runs and checks the date of a task whenever the task is created
// and whenever the date on the task is changed.
var auditTask = function(taskEl) {
  // Now that we know we're getting the li element into auditTask() when it is being 
  // created, we need to check what date was added to its <span> element. 
  // This will involve two actions. First, we need to use jQuery to 
  // retrieve the date stored in that <span> element. Second, we 
  // need to use the moment() function to convert that date value 
  // into a Moment object.

  // get date from task element span
  // gets text content from span which is the date, then trims any whitespace
  // from the front or back if it is there.
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00pm

  // First, we use the date variable we created from taskEl 
  // to make a new Moment object, configured for the user's local time 
  // using moment(date, "L"). Because the date variable does not specify a 
  // time of day (for example, "11/23/2019"), the Moment object will default 
  // to 12:00am. Because work usually doesn't end at 12:00am, we convert it to 
  // 5:00pm of that day instead, using the .set("hour", 17) method. 
  // In this case, the value 17 is in 24-hour time, so it's 5:00pm.
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  // First we utilize the jQuery .removeClass() method to remove any of 
  // these classes if they were already in place. This way, if we update 
  // the due date from yesterday to a week from now, that red background 
  // will be removed, as it will no longer be overdue.
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  // moment() returns the current date and time of the user. 
  // .isAfter(time) compares the current time, to the time specified in the
  // variable "time", and asks if that time is after the current time.
  // this code will run if the current date has overlapped the due date of
  // the task. Meaning they missed the tasks due date, the background of the task
  // will become red. The class we use to turn it red is from bootstrap.
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }

  // Now that we've handled how to check overdue dates, 
  // let's identify upcoming dates.

  // Let's dive into the condition for the else if statement. 
  // These Moment.js functions literally perform left to right. So when 
  // we use moment() to get the current time of the user  
  // and use .diff() afterwards to get the 
  // difference in days of current time to the time of the due date in the future. 
  // When we get this difference, we will get a negative number back. 
  // This can be hard to work with, because we have to check 
  // if the difference is >= -2, which can be hard to conceptualize.
  // Instead we turn it to a positive by wrapping the returning value 
  // of the moment.diff() in the JavaScript Math object's .abs() method
  // to get the absolute value.

  // This says, if the due date of the task is 2 days away or closer,
  // turn the background of the task yellow.
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

};


var createTask = function(taskText, taskDate, taskList) {
  // create new elements that make up a task item
  // to create an element you use brackets <li>. to select an existing element
  // you dont use brackets li.
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

  //check due date of new li element, function above this one
  auditTask(taskLi);

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


// The client has a feeling that users might tend to leave the app open 
// in a browser window for days at a time. If the user doesn't refresh the 
// page, then existing tasks won't be audited and a due date can creep 
// up on them without their knowledge.
// A better user experience would be to periodically check the due dates so 
// the user doesn't need to remember to refresh the page. To 
// do this, we'll automate the logic in the auditTask() function to run 
// every 30 minutes. Luckily, the browser has tools to achieve just this, 
// called timers.
// setInterval's time parameter is counted in milliseconds, thats why
// its so large.

// Here, the jQuery selector passes each element it finds using the selector 
// into the callback function, the element we are looking for is each
// li element (list-group-item) within the ul columns (card), 
// and that element is expressed in the el argument of the function. 
// auditTask() then passes the li element to its routines using the el argument.
// wherew it checks to see the status of the due date and whether or not
// the background color should change
// In this interval, we loop over every task on the page with a class of 
// list-group-item and execute the auditTask() function to check the due 
// date of each one.
setInterval(function () {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, 1800000);



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
  // get current text of span
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    // In jQuery, attr() can serve two purposes. With one argument, 
    // it gets an attribute (e.g., attr("id")). With two arguments, 
    // it sets an attribute (e.g., attr("type", "text")). 
    .attr("type", "text")
    // readonly=true is so that user can not write anything in datepicker.
    // if the user can write random numbers or a date in the wrong format, it messes
    // up the datepicker. So dont allow user to type, but the datepicker in
    // with jQuery UI can still edit the contents
    .attr("readonly", "true")
    .addClass("form-control")
    // set value inside the input box to the date var above
    .val(date);

  // swap out elements. swap span for new created input box
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");

  // enable jquery ui datepicker on the input box
  // NOTE: more info below where we turn the input on the modal ("#modalDueDate")
  // into a datepicker as well.
  dateInput.datepicker({
    minDate: 0,
    // the onClose option for .datepicker() allows us to execute a function 
    // when the date picker closes. It may close when a user clicks anywhere 
    // on the page outside the date picker, so we need to capture that event and 
    // change the date picker back to its original <span> element.
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      // the "change" event is defined below, it basically changes the 
      // input box back into a psan element.
      $(this).trigger("change");
    }
  });

  // automatically bring up the calendar after user clicks.
  dateInput.trigger("focus");

  // see below for saving process

});


// same as above listeners, only this time with due dates.
// above has more comments so see those.
// selecting child <input> of ul with attribute selector input[type='text'].

// value of due date was changed.
// we use change instead of blur this time because we are using a datepicker 
// for the input element of the date. 

// blur enacts whenever the input box is clicked out of, but change enacts
// whenever the input is changed, in this case, we use datepicker to change
// the value of the input.

// with blur the date picker closed without collecting the date 
// information we selected.
// Instead we are going to listen for a change within the input, the datepicker
// is the only thing that enacts change within the input box.

$(".list-group").on("change", "input[type='text']", function() {
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
  // this will also close the datepicker
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  // and change the background color to red or yellow if needed.
  // since audit task only accepts a task object (li), we are finding the
  // spans parent li and passing it into the function.
  auditTask($(taskSpan).closest(".list-group-item"));
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

  // and it makes it to where all of the below options apply to all the
  // ul at the same time, since they are all connected.
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
    // when user is currently dragging the li, make all the
    // ul light gray so that the user knows they can drop the li
    // in those other lists.
    $(this).addClass("dropover");
    // selects the bottom delete zone trash element whenever an li is 
    // being dragged and adds
    // a class to it which causes it to slide up asnd become visible.
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event) {
    // when user lets go of li, remove light gray tint from all the <ul>'s.
    $(this).removeClass("dropover");
    // when user lets go, remove the class and the trash
    // slides back down.
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  // The over and out events trigger when a dragged item enters or 
  // leaves a connected list.
  over: function(event) {
    // method over triggers whenever an li is currently over a ul.
    // we want to get the event.target when the over is triggered, which will 
    // be the ul that was just hovered over. Get the event.target and make the 
    // background black to give feedback to user that they can drop li.
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
    // same as over but opposite.
    $(event.target).removeClass("dropover-active");
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
    // see sortable function above for activate and deactivate
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  // defined in above function.
  over: function(event, ui) {
    // see sortable function above for activate and deactivate
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    // see sortable function above for activate and deactivate
    $(".bottom-trash").removeClass("bottom-trash-active");
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
$("#task-form-modal .btn-save").click(function() {
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


// selecting the input box in the modal, and turning
// it into a datepicker widget using a jQuery UI method
$("#modalDueDate").datepicker({
  // we passed an object into the .datepicker() method and set 
  // key-value pairs of the options we'd like to use. This is the syntax for
  // changing options in jQuery UI methods.

  // We used a value of 1 for the minDate option to indicate how many 
  // days after the current date we want the limit to kick in. 
  // In other words, we've set the minimum date to be today, all dates before today
  // are grayed out.

  // Now if we try to select a date in the modal's form, any days from the 
  // current date or prior are grayed out to inform the user what they can or 
  // can't select. We could implement a lot of other options; some deal with 
  // the overall UI of the date picker while others deal with the 
  // behind-the-scenes logic.
  minDate: 0
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


