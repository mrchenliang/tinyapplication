const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

module.exports = {
  all: () => urlDatabase,
  count: () => urlDatabase.length,
  add: (obj) => urlDatabase.push(Object.assign({id: urlDatabase.length}, obj)),
  one: (id) => urlDatabase.find(e => e.id == id),
  update: (id, obj) => Object.assign(urlDatabase.find(e => e.id == id),obj),
  search: (query) => urlDatabase.filter(e => e.title.includes(query)),
}