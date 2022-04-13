const adminRouter = require('express').Router();
const bcrypt = require('bcrypt');
const { Admin, Product } = require('../db/models');

adminRouter.get('/login', async (req, res) => {
  res.render('admin/login');
});

adminRouter.post('/register', async (req, res) => {
  // console.log('req body ===>', req.body);
  const { inputName, inputMail, inputPass } = req.body;
  // console.log(req.body);
  try {
    const hash = await bcrypt.hash(inputPass, 10);
    const administrator = await Admin.create({
      name: inputName, email: inputMail, password: hash,
    });
    // req.session.admin = administrator.dataValues.name; // - тут не используем так как сначала надо авторизовать права админа
    // console.log('all good!!! ====>', req.session.admin);
    res.send('ваша заявка на получение прав администратора принята');
  } catch (err) {
    res.send(err.message);
  }
});

adminRouter.post('/login', async (req, res) => {
  const { inputMail, inputPass } = req.body;
  try {
    const administrator = await Admin.findOne({ where: { email: inputMail } });
    // console.log(administrator);
    if (administrator.approved) {
      const passwordCheck = await bcrypt.compare(inputPass, administrator.password);
      // console.log('login ----->', passwordCheck);
      if (passwordCheck) {
        req.session.admin = administrator.dataValues.name;
        res.redirect('/'); // успешный вход
      } else {
        res.send('неправильный пароль'); // ! пароль не правильный
      }
    } else {
      res.send('вам еще не одобрили права администратора');
    }
  } catch (err) {
    res.send(err.message);
  }

  // res.send(superUser); // когда создали if else - удаляем
});

adminRouter.get('/logout', async (req, res) => {
  if (req.session.admin) {
    await req.session.destroy();
    res.clearCookie('MyCookieName');
    res.redirect('/');
  } else {
    res.redirect('main');
  }
});

adminRouter.delete('/products/delete', async (req, res) => {
  const { id } = req.body;
  await Product.destroy({ where: { id } });
  res.sendStatus(200);
});

module.exports = adminRouter;
