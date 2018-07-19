global.validationProperties = {
  logValidate: false
};

global.dbProperties = {
  uri: '111.222.333.444:5555/VVVVV',
  currentFlow: {
    collection: 'myColection',
    selection: {
      name: "myDocument"
    }
  }
};


console.log("Global Validation Properties: " + JSON.stringify(validationProperties));

