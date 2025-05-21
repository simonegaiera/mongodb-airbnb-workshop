---
title: "Hint: Exercise 6"  
permalink: /crud/6/hint/  
layout: single  
classes: wide  
---  

## ✨ Hint: MongoDB `updateOne` + `$set` Power

Time to give your data a makeover!  
With `updateOne` and the mighty `$set` operator, you can update exactly what you want—no more, no less.

- 🛠️ **updateOne**: Update a single document that matches your criteria.  
  [updateOne Documentation](https://www.mongodb.com/docs/manual/reference/method/db.collection.updateOne/)  
- 🎯 **$set**: Change the value of any field in your document, instantly.  
  [$set Documentation](https://www.mongodb.com/docs/manual/reference/operator/update/set/)  

### 🚀 Dynamic Updates with `$set`

Want to update a field, but the field name is stored in a variable? No problem!  
MongoDB lets you use dynamic keys for ultra-flexible updates:

```javascript
{ [key]: value }
```

- `key`: The variable holding your field name.
- `value`: The new value you want to set.

💡 This trick lets you build smart, adaptable update operations—perfect for apps that need to move fast and stay flexible!
