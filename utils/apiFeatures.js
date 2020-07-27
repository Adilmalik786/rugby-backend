class APIFeatures{
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter(){
        // { dissculty:easy, duration:{ $gte : 5 } }  mongodb query  =>   duration[gte]=5
        // { dissculty:easy, duration:{ gte : 5 } }  what we get    $ is missing
        // solution : replace mongoDB operators with $operators i.e gt,gte,lt,lte
        const queryObj = {...this.queryString};
        const excludeFields = ['page','sort','limit','fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        // 1) Advance Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        //Build Query
        this.query.find(JSON.parse(queryStr));
        //let query = User.find(JSON.parse(queryStr));
        return this;
    }
    sort(){
        // 2)  Sorting     price=> ascending order  -price => descending order
        if (this.queryString.sort) {
            //if 2 sorting fields are there
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-password');
        }
        return this;
    }
    limitFields(){
        // 3) Field Limiting    => fields =name,duration,difficulty,price
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);        // projection operation
        } else {
            this.query = this.query.select('-__v'); // removing field from the response
        }
        return this;
    }
    paginate () {
        // PAGINATION
        //page=2&limit=10
        const page = this.queryString.page * 1 || 1;   // convert string to number and by default we want page# 1
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIFeatures;
