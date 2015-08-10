# Mention Field
This field has support for 'mentioning' users. You can bind a store to this textfield, and use the '@' to trigger a lookup of the store. This will  display a picker from which you can choose a matching value. Selecting a value will replace the search text with a special syntax '[~some_selected_value]' that can be used for other purposes in other interfaces. 

![Mention](/docs/mention.png)

# Querying and Paging
As with Ext.form.field.ComboBox, this custom field can be configured with remote or local querying, and even paging of the results.

# Thumbnail Support
Although you could use this with *any* data, the primary use case for the Mention field is with a person list. To this end, it has been configured to support thumbnails in the search list. All you have to do is add a few configs:

* includeImage: Set to *true* to enable the tpl to be updated to include a thumbnail
* imageField: The field in your store\'s results where the thumbnail path exists
* defaultImage: Path to an image to use when no image is found in the data

# Extra Customization
By default, the "@" is the trigger to start a lookup for a value, and the resulting selection will be wrapped like so for inclusion in the raw field value: [~{valueField}]. 

If needed, you can adjust this to suit your own formats with the following configs:

* mentionTrigger: The character to match on to initiate a lookup (e.g. "@" or "+")
* mentionStartPattern: The opening part of the pattern to use for setting the raw value of the selection which will identify the beginning of a "mention" section
* mentionEndPattern: The closing part of the pattern to use for setting the raw value of the selection which will identify the ending of a "mention" section

# Examples
There is an example application (Ext JS 6) in "examples" that demonstrates several of the different ways that Mention can be configured. 
