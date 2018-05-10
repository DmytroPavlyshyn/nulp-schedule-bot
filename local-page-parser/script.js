const inst = []
const groups = []

$('#stud select[name="inst"]').find('option').each((index, option) => {
    const $option = $(option)
    inst.push({
        value: $option.attr('value'),
        name: $option.text()
    })  
});

console.log(inst)

$('#stud select[name="group"]').find('option').each((index, option) => {
    const $option = $(option)
    groups.push({
        value: $option.attr('value'),
        name: $option.text()
    })
});

console.log(groups);
