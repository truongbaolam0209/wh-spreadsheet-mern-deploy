const express = require('express');
const mongoose = require('mongoose');
const { HTTP } = require('./errors');


const genCRUDHandlers = (model, options = {}) => {
   let {
      genQueryToFindOne = defaultGenQueryToFindOne,
      genQueryToFindMany = defaultGenQueryToFindMany,
      formalItemToCreate = defaultFormalItemToCreate,
      formalItemToUpdate = defaultFormalItemToUpdate,
      validateItemToDelete = defaultValidateItemToDelete

   } = options;

   return {

      async findOne(req, res, next) {
         try {
            if (!id) throw new HTTP(404);
            let {
               fields: qFields,
               options: qOptions,
               populate: qPopulate
            } = genQueryToFindOne(id);

            let command = model.findById(id, qFields, qOptions);

            if (qPopulate) command.populate(qPopulate);

            let item = await command.exec();

            return res.json(item);

         } catch (error) {
            next(error);
         };
      },

      async findMany(req, res, next) {
         try {
            let {
               filter: qFilter,
               fileds: qFields,
               options: qOptions,
               populate: qPopulate
            } = await genQueryToFindMany(req.query);

            let command = model.find(qFilter, qFields, qOptions);

            if (qPopulate) command.populate(qPopulate);


            let items = await command.exec();
            return res.json(items);

         } catch (error) {
            next(error);
         };
      },

      async create(req, res, next) {
         try {
            let data = await formalItemToCreate(req.body);
            let item = await model.create(data);

            return res.json(item);
         } catch (error) {
            next(error);
         }
      },

      async update(req, res, next) {
         try {
            if (!id) throw new HTTP(404, 'Missing item id to update!');
            let data = await formalItemToUpdate(req.body);
            let updatedItem = await model.findByIdAndUpdate(id, data, { new: true });

            return res.json(updatedItem);
         } catch (error) {
            next(error);
         };
      },

      async delete(req, res, next) {
         try {
            if (!id) throw new HTTP(404, 'Missing item id to delete!');

            await validateItemToDelete(id);
            let { deletedCount = 0 } = await model.deleteOne({ _id: id });
            return res.json({ deletedCount });

         } catch (error) {
            next(error);
         };
      },
   };
};

function defaultGenQueryToFindOne(id) {
   return {
      fields: null,
      options: null,
      populate: null
   };
};

function defaultGenQueryToFindMany(requestQuery = {}) {
   return {
      query: {},
      fields: null,
      options: null,
      populate: null
   };
};

function defaultFormalItemToCreate(data = {}) {
   return data;
};

function defaultFormalItemToUpdate(data = {}) {
   return data;
};

function defaultValidateItemToDelete(id) {
   return true;
};

module.exports = {
   genCRUDHandlers
};
