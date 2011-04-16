(function($)
{
    $.ratchet = Ratchet;

    $.fn.ratchet = function(func) {

        // instantate the console on top of the "this" jQuery element
        return new Ratchet(this[0], func);
    };

    /**
     * Used to convert a form into json
     */
    $.fn.serializeObject = function() {
        return window.form2object(this[0]);
    };

    /**
     * Finds the closest child that matches the given selector using a breadth first lookup.
     *
     * @param selector
     */
    /*
    $.fn.closestChild = function(selector) {

		// breadth first search for the first matched node
		if (selector && selector != '')
        {
			var queue = [];
			queue.push(this);
			while(queue.length > 0)
            {
				var node = queue.shift();
				var children = node.children();
				for(var i = 0; i < children.length; ++i)
                {
					var child = $(children[i]);
					if (child.is(selector))
                    {
						return child;
					}

                    queue.push(child);
				}
			}
		}

        // nothing was found
		return $();
	};
	*/

    /**
     * Uses a recursive, breadth first approach to walk the descendants of the current DOM element and
     * find any nodes that are first matches to the given selector.  This produces an array of objects which
     * constitute the first matches on their branches of the dom tree.
     *
     * This method is used to find the "first" [gadget] tags seen by a parent ancestor without traversing down
     * into any child [gadget]s.
     *
     * @param selector
     */
    $.fn.closestDescendants = function(selector) {

        // short cut
        if (!selector || selector == '')
        {
            return $();
        }

        var descendants = [];

        var drill = function(node)
        {
            if (node.is(selector))
            {
                descendants.push(node);
                return;
            }

            // children
            var children = node.children();
            for (var i = 0; i < children.length; i++)
            {
                drill($(children[i]));
            }
        };

        drill(this);

        return $(descendants);
    }


})(jQuery);