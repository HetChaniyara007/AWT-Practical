const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'demo.txt');

// 1. Write to a file
console.log('1. Writing to file...');
fs.writeFile(filePath, 'Hello, this is a demonstration of the File System module.\n', (err) => {
    if (err) throw err;
    console.log('-> File created and text successfully written!');

    // 2. Read from the file
    console.log('\n2. Reading from file...');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) throw err;
        console.log('-> File Content:');
        console.log(data);
        
        // 3. Append to the file
        console.log('3. Appending to file...');
        fs.appendFile(filePath, 'This is an appended line.\n', (err) => {
             if (err) throw err;
             console.log('-> Text appended to file!');
             
             // 4. Read again to show changes
             fs.readFile(filePath, 'utf8', (err, updatedData) => {
                if (err) throw err;
                console.log('\n-> Updated File Content:');
                console.log(updatedData);
             });
        });
    });
});
