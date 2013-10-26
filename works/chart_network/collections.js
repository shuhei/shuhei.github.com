var Collections = {
    sort: function ( list, comparator ) {
        var arr = list.toArray();
        if ( comparator )
            arr.sort(comparator.compare);
        else
            arr.sort();
        list.clear();
        list.addAll(arr);
    }
};