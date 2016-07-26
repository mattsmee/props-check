_ = require('ramda');


// type alias Spec =
//   { String : * }

// type alias PropCheckResult =
//   { String : [ String ] }

// type alias Key = [ String ]


// notNullOrEmpty :: * -> Boolean
const notNullOrEmpty = _.compose( _.not, _.either( _.isNil, _.isEmpty ) );


// nothingIsWrong :: ( Spec, PropCheckResult ) -> Boolean
const nothingIsWrong = (spec, result) => {
  return _.isEmpty(_.difference(_.keys(spec), _.keys(result)));
};


// formattedUserInput :: ( Spec, PropCheckResult ) -> String
const formattedUserInput = (spec, result) => {

  var keys = [];
  for (const key of _.keys(result)) {
    keys.push('\n      ' + key + ': …');
  }

  if (_.isEmpty(keys)) return null;

  return '  You gave me this:\n\n    {'
    + keys.join(',')
    + '\n    }';
};


// getPseudoObjectString :: [ Key ] -> String
const getPseudoObjectString = (keys) => {

  var pseudoKeyValuePairs = [];

  for (const key of keys) {
    pseudoKeyValuePairs.push(key + ': …');
  }

  if (_.isEmpty(pseudoKeyValuePairs)) return null;

  return '{ ' + pseudoKeyValuePairs.join(', ') + ' }';
};


// getErrorMessage :: ( String , String ) -> Maybe String
const getErrorMessage = _.curry((header, message) => {
  if (header === null || message === null) return null;
  else return (header + message);
});


// formattedIncorrectInput :: ( Spec, PropCheckResult ) -> String
const formattedIncorrectInput = (spec, result) => {
  return _.compose (
    getErrorMessage('  I wasn\'t expecting:\n\n    ')
  , getPseudoObjectString
  , _.difference
  )(_.keys(result), _.keys(spec));
};


// formattedExpectedInput :: ( Spec, PropCheckResult ) -> String
const formattedExpectedInput = (spec, result) => {
  return _.compose (
    getErrorMessage('  You didn\'t give me:\n\n    ')
  , getPseudoObjectString
  , _.difference
  )(_.keys(spec), _.keys(result));
};


// formattedCorrection :: ( Spec, PropCheckResult ) -> String
const formattedCorrection = (spec, result) => {

  var suggested_corrections = [];
  for (const key of _.keys(result)) {
    if (notNullOrEmpty(result[key])) {
      suggested_corrections.push(
        '    ' + key + ' <-> ' + result[key].join(' or ')
      );
    }
  }

  if (_.isEmpty(suggested_corrections)) return null;

  return '  You fu*ked up, here\'s how to fix it:\n\n'
    + suggested_corrections.join('\n');
};


// readableErrorMessage :: ( Spec, PropCheckResult ) -> String
const readableErrorMessage = _.curryN(2, _.compose(
  _.join('\n\n')
, _.filter(notNullOrEmpty)
, _.juxt([
    formattedUserInput
  , formattedIncorrectInput
  , formattedExpectedInput
  , formattedCorrection
  ])
));


// human :: ( Spec, PropCheckResult ) -> String
const human = (spec, result) => {
  if (nothingIsWrong(spec, result)) return null;
  return readableErrorMessage(spec, result);
};


module.exports = human;