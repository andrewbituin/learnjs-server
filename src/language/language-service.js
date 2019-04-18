'use strict';
const { LinkedList } = require('./LinkedList.js')
const { NewLinkedList } = require('./NewLinkedList');
const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },
  postUserWords(db, linkedList) {
    // iterate over the linked list
    // insert each one according to each node's value id via an array of linked list object
    // next: node.next ? node.next.value.id : null 
    // convert list into an array

    let newArray = [];
    let newCurrNode = linkedList.head;
    while (newCurrNode !== null) {
      newArray.push(newCurrNode.value);
      newCurrNode = newCurrNode.next;
    }
    console.log(newArray)
    return newArray.map((item, index) => {
      const wordObj = {
        memory_value: item.memory_value,
        correct_count: item.correct_count,
        incorrect_count: item.incorrect_count,
        next: newArray[index + 1] ? newArray[index + 1].id : null // OR linkedList.head.value.id?
      };
      return db('word')
        .update(wordObj)
        .where('id', item.id);
    } )  
  },
  // update appropriate fields in language table once user responds with an answer, pointing to the new head
  postUserLanguage(db, id, langObj) {
    // update total score and the head 
    return db('language')
      .update(langObj)
      .where('id', id);
  },
  getWordByLanguageHead(db, language_id){
    return db
      .from('word')
      .join('language', 'word.id','=','language.head')
      .select(
        'original',
        'language_id',
        'correct_count',
        'incorrect_count'
      )
      .where({language_id});
  },
  generateLinkedListTwo(words, head, total_score){
    const ll = new NewLinkedList(words[0].language_id, 'JavaScript', total_score);
    let word = words.find(item => item.id === head)
    ll.insertHead(word);

    while(word.next){
      word = words.find(item => item.id === word.next)
      ll.insertTail(word)
    }
    return ll
  },
  generateLinkedList(words, head){
    // find the head of the linked list in the words array via the language.head
    const headObj = words.find(word => word.id === head);
    const headIndex = words.indexOf(headObj);
    const headNode = words.splice(headIndex,1);
    const list = new LinkedList();

    // insert the head into the linked list
    list.insertLast(headNode[0]);

    // find the next node for the linked list in the words array
    let nextId = headNode[0].next;
    let currentWord = words.find(word => word.id === nextId);
    list.insertLast(currentWord);

    nextId = currentWord.next;
    currentWord = words.find(word => word.id === nextId);

    // iterate through the words array and insert each item into the linked list 
    while(currentWord !== null){
      list.insertLast(currentWord);
      nextId = currentWord.next;
      if(nextId === null){
        currentWord = null;
      } else {
        currentWord = words.find(word => word.id === nextId);
      }
    }
    return list;
  },
};

module.exports = LanguageService;
