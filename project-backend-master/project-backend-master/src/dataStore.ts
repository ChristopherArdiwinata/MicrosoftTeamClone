// YOU SHOULD MODIFY THIS OBJECT BELOW
import fs from 'fs';
import { dataTs } from './interfaces';
let data: dataTs = {
  users: [],
  channels: [],
  dms: [],
  deletedUsers: []
};
// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use getData() to access the data
function getData() {
  if (fs.existsSync('./database.json')) {
    const dbstr = fs.readFileSync('./database.json');
    data = JSON.parse(String(dbstr));
  }
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: dataTs) {
  data = newData;
  const jsonstr = JSON.stringify(data);
  fs.writeFileSync('./database.json', jsonstr);
}

export { getData, setData };
