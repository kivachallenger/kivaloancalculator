

// Number of themes across all loaded loans
//db.loans.aggregate([{$unwind: '$themes'}, {$group: {_id: '$themes', sum: {$sum: 1}}}])

// Number of stored loans per team
//db.teams.aggregate({$project: {_id: 1, count: {$size: '$loans'}}})
