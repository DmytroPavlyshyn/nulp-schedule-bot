const inst = []
const groups = []

$('#stud select[name="inst"]').find('option').each((index, option) => {
    const $option = $(option)
    const value=$option.attr('value');
    if (value){
        inst.push({
            value,
            name: $option.text()
        })  
    }
});

console.log(inst)

$('#stud select[name="group"]').find('option').each((index, option) => {
    const $option = $(option)
    const value=$option.attr('value');
    groups.push({
        value,
        name: $option.text()
    })
});

console.log(groups);

$('#stud select[name="inst"]').find('option').each((index, option) => {
    const $option = $(option)
    const value=$option.attr('value');
    if (value){
        inst.push({
            value,
            name: $option.text()
        })  
    }
});