const AdminBro = require("admin-bro");
const AdminBroExpressjs = require("@admin-bro/express");
const AdminBroMongoose = require("@admin-bro/mongoose");
const mongoose = require("mongoose");
const project = require("../config/project");
const user = require("../config/user");
const eventregistrations = require("../config/event");


AdminBro.registerAdapter(AdminBroMongoose);

const canModifyUsers = ({ currentAdmin }) =>
  currentAdmin && currentAdmin.role === "admin";

const canEditEmp = ({ currentAdmin, record }) => {
  return currentAdmin && currentAdmin.role === "admin";
};