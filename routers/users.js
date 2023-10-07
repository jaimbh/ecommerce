const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get(`/`, async (req, res)=>{
	const userList = await User.find().select('-passwordHash');
	
	if(!userList) return res.status(500).json({success: false});
	
	res.send(userList);
})

router.get(`/:id`, async (req, res)=>{
	const user = await User.findById(req.params.id).select('-passwordHash');
	
	if(!user) return res.status(500).json({message: 'User not found!'});
	
	res.status(200).send(user);
})

router.get('/get/count', async (req, res)=>{
	const userCount = await User.countDocuments();
	
	if(!userCount) return res.status(500).json({success: false});
	
	res.json({count: userCount});
})

router.delete(`/:id`, (req, res)=>{
	User.findByIdAndDelete(req.params.id)
	.then(user => {
		if(user){
			return res.status(200).json({success: true, message: 'User deleted!'});
		}else{
			return res.status(404).json({success: false, message: 'User not found!'});
		}
	})
	.catch(err => {
		return res.status(400).json({success: false, error: err});
	})
})

router.post(`/`, async (req, res)=>{
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		passwordHash: bcrypt.hashSync(req.body.password, 10),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		street: req.body.street,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});
	
	user = await user.save();

	if(!user) return res.status(500).send('User cannot be created!');
	
	res.send(user);
});

router.post(`/register`, async (req, res)=>{
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		passwordHash: bcrypt.hashSync(req.body.password, 10),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		street: req.body.street,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});
	
	user = await user.save();

	if(!user) return res.status(500).send('User cannot be created!');
	
	res.send(user);
});

router.post('/login', async (req, res)=>{
	const user = await User.findOne({email: req.body.email});
	const secret = process.env.secret;

	if(!user) return res.status(400).send('User not found!');
	
	if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
		const token = jwt.sign(
			{
				userId: user.id,
				isAdmin: user.isAdmin
			},
			secret,
			{expiresIn: '1d'}
		);
		
		res.status(200).json({user: user.email, token: token});
	}else{
		res.status(400).send('Invalid password!');		
	}
});

module.exports = router;