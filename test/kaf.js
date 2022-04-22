
import fetch from 'node-fetch';

(async () => {
  let res = await fetch('https://www.khanacademy.org/api/internal/scratchpads/6511200389087232?format=pretty')
  let data = await res.json()
  console.log(data)
})();