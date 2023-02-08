let link = 'https://api.github.com/repos/tibonto/dr/commits/master'

fetch(link, {
      method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(data)
    }).then(function(resp){
        // console.log(resp.json());
        return resp.json();
    }).then((body)=>{
        console.log(body.sha)
        console.log(body.commit.message)
        // let b = JSON.parse(body);
        // console.log(b)
    })