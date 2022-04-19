import { exec } from 'child_process';

const handleStd = (child) => {
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', console.log);
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', console.log);
  child.on('close', function (code) {
    //Here you can get the exit code of the script
    console.log('closing code: ' + code);
    if (code === 77) {
      console.log('Restarting bot...');
      botProcess = exec('node bot.js');
      handleStd(botProcess);
    }
  });
};

// Run "node bot.js" and restart the bot whenever an exit code of 77 is returned
let botProcess = exec('node bot.js');
handleStd(botProcess);

