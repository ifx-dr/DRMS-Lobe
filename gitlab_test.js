let link = 'https://gitlab.intra.infineon.com/api/v4/projects/liuyip%2Ftest_gitlab/repository/commits/main'
link = 'https://gitlab.intra.infineon.com/api/v4/projects/liuyip%2Finternal_test/repository/commits'
link = 'https://gitlab.intra.infineon.com/api/v4/projects/liuyip%2Fprivate_Test/repository/commits'
link = 'https://gitlab.intra.infineon.com/liuyip/time_subontology/-/blob/main/time.owl?private_token=glpat-fckSg7JfZP-nhSg4QFSg'
link = 'https://gitlab.intra.infineon.com/api/v4/projects/liuyip%2Ftime_subontology/repository/commits/main'
link = 'https://gitlab.intra.infineon.com/api/v4/projects/digital-reference%2Fprocess_model_version/repository/commits/main'
fetch(link, {
      method: 'GET',
      headers: {
        "PRIVATE-TOKEN":"glpat-tbi7Q9X_rsrZZg8zC9Cw"
      },
    //   body: JSON.stringify(data)
    }).then(function(resp){
        
        return resp.json();
    }).then((body)=>{
        console.log(body)
        // console.log(body.id)
        // console.log(body.message)
        // let b = JSON.parse(body);
        // console.log(b)
    })

// a = '2023-01-16T09:06:50Z'
// b = new Date(a)
// console.log(b.getMonth())