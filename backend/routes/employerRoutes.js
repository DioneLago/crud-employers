const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const { Employer } = require('../models/Employer');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { search, status, closingPeriodicity } = req.query;
    const filter = {};

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    if (status === 'ativo') {
      filter.terminationDate = null;
    } else if (status === 'desligado') {
      filter.terminationDate = { $ne: null };
    }

    if (closingPeriodicity) {
      filter.closingPeriodicity = closingPeriodicity;
    }

    const employers = await Employer.find(filter).sort({ admissionDate: 1, createdAt: 1 });
    return res.status(200).json(employers);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID do funcionário inválido.' });
    }

    const employer = await Employer.findById(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    return res.status(200).json(employer);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, admissionDate, terminationDate, workStart, workEnd, closingPeriodicity } = req.body || {};

    // As datas representam dias do calendário e são normalizadas em UTC para evitar desvios de fuso.
    const parsedAdmission = admissionDate
      ? moment.utc(admissionDate, 'YYYY-MM-DD', true).startOf('day')
      : null;

    if (admissionDate && !parsedAdmission.isValid()) {
      return res.status(400).json({ message: 'Data de admissão inválida.' });
    }

    let parsedTermination = null;
    if (terminationDate) {
      const termination = moment.utc(terminationDate, 'YYYY-MM-DD', true).startOf('day');

      if (!termination.isValid()) {
        return res.status(400).json({ message: 'Data de demissão inválida.' });
      }
      parsedTermination = termination.toDate();
    }

    const employer = new Employer({
      name,
      admissionDate: parsedAdmission ? parsedAdmission.toDate() : undefined,
      terminationDate: parsedTermination,
      workStart,
      workEnd,
      closingPeriodicity,
    });

    await employer.save();
    return res.status(201).json(employer);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID do funcionário inválido.' });
    }

    const employer = await Employer.findById(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    const { name, admissionDate, terminationDate, workStart, workEnd, closingPeriodicity } = req.body || {};

    const parsedAdmission = admissionDate
      ? moment.utc(admissionDate, 'YYYY-MM-DD', true).startOf('day')
      : null;

    if (admissionDate && !parsedAdmission.isValid()) {
      return res.status(400).json({ message: 'Data de admissão inválida.' });
    }

    let parsedTermination = null;
    if (terminationDate) {
      const termination = moment.utc(terminationDate, 'YYYY-MM-DD', true).startOf('day');

      if (!termination.isValid()) {
        return res.status(400).json({ message: 'Data de demissão inválida.' });
      }
      parsedTermination = termination.toDate();
    }

    employer.name = name;
    employer.admissionDate = parsedAdmission ? parsedAdmission.toDate() : employer.admissionDate;
    employer.terminationDate = parsedTermination;
    employer.workStart = workStart;
    employer.workEnd = workEnd;
    employer.closingPeriodicity = closingPeriodicity;

    // O save mantém o documento como contexto das validações entre campos.
    await employer.save();
    return res.status(200).json(employer);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID do funcionário inválido.' });
    }

    const deleted = await Employer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    return res.status(200).json({ message: 'Funcionário excluído com sucesso.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
