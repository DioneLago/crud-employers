const mongoose = require('mongoose');
const moment = require('moment');

const PERIODICITIES = ['Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'];
const TIME_FORMAT = 'HH:mm';

const employerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
      trim: true,
      validate: [
        {
          validator: (value) => typeof value === 'string' && value.trim().length > 0,
          message: 'O nome é obrigatório.',
        },
        {
          validator: (value) => !/\d/.test(value),
          message: 'O nome não pode conter números.',
        },
      ],
    },
    admissionDate: {
      type: Date,
      required: [true, 'A data de admissão é obrigatória.'],
    },
    terminationDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          if (!value || !this.admissionDate) {
            return true;
          }
          const admission = moment.utc(this.admissionDate);
          const termination = moment.utc(value);
          if (!admission.isValid() || !termination.isValid()) {
            return false;
          }
          return !termination.isBefore(admission, 'day');
        },
        message: 'A data de demissão não pode ser anterior à data de admissão.',
      },
    },
    workStart: {
      type: String,
      required: [true, 'A hora de início do expediente é obrigatória.'],
      trim: true,
      validate: {
        validator: (value) => moment(value, TIME_FORMAT, true).isValid(),
        message: 'A hora de início do expediente deve estar no formato HH:mm.',
      },
    },
    workEnd: {
      type: String,
      required: [true, 'A hora de fim do expediente é obrigatória.'],
      trim: true,
      validate: [
        {
          validator: (value) => moment(value, TIME_FORMAT, true).isValid(),
          message: 'A hora de fim do expediente deve estar no formato HH:mm.',
        },
        {
          validator: function (value) {
            const start = moment(this.workStart, TIME_FORMAT, true);
            const end = moment(value, TIME_FORMAT, true);
            if (!start.isValid() || !end.isValid()) {
              return true;
            }
            return !end.isBefore(start);
          },
          message: 'A hora de fim do expediente não pode ser anterior à hora de início.',
        },
      ],
    },
    closingPeriodicity: {
      type: String,
      required: [true, 'A periodicidade do fechamento é obrigatória.'],
      enum: {
        values: PERIODICITIES,
        message:
          'A periodicidade do fechamento deve ser Mensal, Bimestral, Trimestral, Semestral ou Anual.',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Employer = mongoose.model('Employer', employerSchema);

module.exports = {
  Employer,
  PERIODICITIES,
};
