const express = require("express");
const tasksService = require("./task-service");
const { requiresAuthorization } = require("../middleware/jwt-auth");

const tasksRouter = express.Router();
const jsonBodyParser = express.json();

// Create new task-handles post request to tasks end point
tasksRouter
  .route("/")
  .post(requiresAuthorization, jsonBodyParser, async (req, res, next) => {
    const { title: title, list_id: listId } = req.body;
    const task = { title: title, list_id: listId };

    if (task.title.length == 0)
      return res
        .status(400)
        .json({ error: `Missing title in request body` });

    task.user_id = req.user.id;

    try {
      const taskToDb = await tasksService.postTask(
        req.app.get("db"),
        task
      );
      return res.status(201).json(tasksService.serializeTask(taskToDb));
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

// Get all tasks-handles get request to tasks end point
tasksRouter
  .route("/")
  .all(requiresAuthorization)
  .get(async (req, res, next) => {
    const listId = req.query.listid;
    try {
      const tasks = await tasksService.getTasksByListId(
        req.app.get("db"),
        listId
      );
      return res.json(tasks.map(tasksService.serializeTask));
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

// Delete task based on task ID-handles delete request to tasks end point
tasksRouter.route("/delete").delete(async (req, res, next) => {
  const taskId = req.query.id;
  try {
    const numRowsAffected = await tasksService.deleteTask(
      req.app.get("db"),
      taskId
    );
    console.log(numRowsAffected);
    return res.status(204).end();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = tasksRouter;
