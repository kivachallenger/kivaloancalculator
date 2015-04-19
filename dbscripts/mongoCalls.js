

//db.loans.aggregate([{$unwind: '$themes'}, {$group: {_id: '$themes', sum: {$sum: 1}}}])