var Db = require('../db');
var everpolate = require('../lib/everpolate.browserified.min');

var CURVES = {

  //
  // x = level, y = quantity
  //
  dose: '(0,1)(55,5)',

  //
  // x = percent, y = effect
  //
  doseEffect: '(0,0)(0.5,0.7)(0.75, 0.9)(0.875, 0.95)',

  //
  // x = level, y = efficiency
  //
  coach: '(0,0)(5,0.03)(13,0.15)(25,0.5)(45,0.85)(55,0.95)(67,1)',

  //
  // x = level, y = requirements
  //
  level: '(0,0.1)(1,0.3)(3,0.7)(6,1.5)(10,3)(16,4)(25,8)(38,13)(40,25)(50,50)(60,80)(67,150)',

  //
  // x = level, y = mass
  //
  mass: '(0,45)(67,155)',

  //
  // x = repeats, y = effect
  //
  repeatsEffect: '(0,0.3)(1,0.3)(3,0.6)(6,0.82)(10,0.97)(12,1)(14,0.97)(20,0.78)(25,0.6)(30,0.5)(35,0.5)',

  ex0: { // Подтягивание

    //
    // x = mass, y = weightMax
    //        
    weight: '(40,35)(45,42)(50,55)(60,73)(85,120)(100,155)(120,190)(155,220)',

    //
    // x = percent of max, y = effect
    //        
    repeats: '(0,20)(0.2,14)(0.55,7)(0.8,3)(1,1)(1.2,0.5)(1.5,0.2)(2,0)'

    //

  },

  ex1: { // Брусья

    weight: '(40,41)(45,46)(52,56)(60,67)(85,110)(100,140)(120,185)(155,265)',
    repeats: '(0,22)(0.2,22)(0.55,18)(0.8,6)(1,1)(1.2,0.5)(1.5,0.2)(2,0)'

  },

  ex2: { // Жим лежа

    weight: '(45,40)(53,60)(59,70)(66,80)(74,86)(83,91)(93,95)(105,105)(120,115)(143,135)',
    repeats: '(0.2,60)(0.3,45)(0.5,26)(0.7,13)(0.8,8)(0.9,4)(1,1)(1.5,0.4)(2,0)'

  },

  ex3: { // Присед

    weight: '(45,60)(53,100)(59,110)(66,120)(74,132)(83,147)(93,157)(105,174)(120,187)(143,240)',
    repeats: '(0.43,40)(0.5,32)(0.57,25)(0.64,20)(0.71,15)(0.86,7)(1,1)(1.5,0.4)(2,0)'

  },

  ex4: { // Становая

    weight: '(45,60)(53,100)(59,110)(66,120)(74,134)(83,149)(93,159)(105,182)(120,200)(143,265)',
    repeats: '(0.43,40)(0.5,32)(0.57,25)(0.64,20)(0.71,15)(0.86,7)(1,1)(1.5,0.4)(2,0)'
  },

  ex5: { // Тяга в наклоне

    weight: '(45,15)(62,23)(82,33)(100,42)(125,54)(155,70)',
    repeats: '(0.2,60)(0.3,45)(0.5,26)(0.7,13)(0.8,8)(0.9,4)(1,1)(1.5,0.4)(2,0)'
  },


  ex6: { // Бицуха

    weight: '(45,12)(62,18)(82,26)(100,34)(125,46)(155,62)',
    repeats: '(0.2,60)(0.3,45)(0.5,26)(0.7,13)(0.8,8)(0.9,4)(1,1)(1.5,0.4)(2,0)'
  },

  ex7: { // Шраги

    weight: '(45,30)(62,45)(82,85)(100,140)(125,190)(155,220)',
    repeats: '(0.43,60)(0.5,45)(0.57,26)(0.64,13)(0.71,8)(0.86,4)(1,1)(1.5,0.4)(2,0)'
  },

  ex8: { // Француз

    weight: '(45,7)(62,16)(82,27)(100,36)(125,48)(155,61)',
    repeats: '(0.2,60)(0.3,45)(0.5,26)(0.7,13)(0.8,8)(0.9,4)(1,1)(1.5,0.4)(2,0)'
  },

  ex9: { // Пресс

    weight: '(45,0)(62,8)(82,20)(100,30)(125,43)(155,60)',
    repeats: '(0.2,60)(0.3,45)(0.5,26)(0.7,13)(0.8,8)(0.9,4)(1,1)(1.5,0.4)(2,0)'
  },

  ex10: { // Жим ногами

    weight: '(45,30)(62,70)(82,140)(100,220)(125,330)(155,450)',
    repeats: '(0.43,40)(0.5,32)(0.57,25)(0.64,20)(0.71,15)(0.86,7)(1,1)(1.5,0.4)(2,0)'

  },

  ex11: { // Гиперэкстензии

    weight: '(45,0)(62,8)(82,20)(100,30)(125,43)(155,60)',
    repeats: '(0.2,60)(0.3,45)(0.5,26)(0.7,13)(0.8,8)(0.9,4)(1,1)(1.5,0.4)(2,0)'
  },

  ex12: { // Боковой пресс

    weight: '(45,0)(62,8)(82,20)(100,30)(125,43)(155,60)',
    repeats: '(0.2,60)(0.3,45)(0.5,26)(0.7,13)(0.8,8)(0.9,4)(1,1)(1.5,0.4)(2,0)'
  },

};

function getValue(points, x) {
  var xArray = [];
  var yArray = [];

  points = points.split(')');
  points.pop();

  points.forEach(function(point) {
    point = point.substring(1);
    var coords = point.split(',');
    xArray.push(parseFloat(coords[0]));
    yArray.push(parseFloat(coords[1]));
  });

  //return everpolate.polynomial([x], xArray, yArray)[0];
  return everpolate.linear([x], xArray, yArray)[0];
}

module.exports = {

  getDoseEffect: function(perc) {
    var eff = getValue(CURVES.doseEffect, perc);
    return eff;
  },

  getDose: function(level) {
    var q = getValue(CURVES.dose, level);
    return Math.floor(q);
  },

  getCoachRate: function(level) {
    var eff = this.getCoachEfficiency(level);
    return Math.ceil(eff * 5);
  },

  getCoachEfficiency: function(level) {
    return getValue(CURVES.coach, level);
  },

  getLevelRequirements: function(level) {
    return getValue(CURVES.level, level);
  },

  getMass: function(level) {
    return getValue(CURVES.mass, level);
  },

  getRepeatsEffect: function(repeats) {
    return getValue(CURVES.repeatsEffect, repeats);
  },

  getWeightMax: function(level, id) {
    var mass = this.getMass(level);
    var weightMax = getValue(CURVES['ex' + id].weight, mass);
    return weightMax;
  },

  getRepeatsMax: function(level, id, weight, weightMax) {
    weightMax = weightMax || this.getWeightMax(level, id);

    var exRef = Db.getRefs().exercises[id];
    if (exRef.selfweight)
      weight += this.getMass(level);

    var percent = weight / weightMax;
    var repeatsMax = getValue(CURVES['ex' + id].repeats, percent);
    if (repeatsMax < 0)
      repeatsMax = 0;
    return repeatsMax;
  },

  getFoodProfit: function(type, percent) {
    return getValue(CURVES[type], percent);
  },

};