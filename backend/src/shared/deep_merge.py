import collections.abc
import copy

def deep_merge(source: dict, destination: dict) -> dict:
    """
    Recursively merges two dictionaries.

    The function handles nested dictionaries and lists of dictionaries.
    When merging lists, it matches items by a common 'id' key. If an item
    in the destination list has an id that exists in the source list, the
    items are merged. If the id is new, the item is appended.

    Args:
        source (dict): The original dictionary.
        destination (dict): The dictionary with updates to merge into the source.

    Returns:
        dict: The merged dictionary.
    """
    # Use deepcopy to ensure the original source is not mutated
    result = copy.deepcopy(source)

    for key, value in destination.items():
        if isinstance(value, collections.abc.Mapping):
            # If the key points to a dictionary, recursively merge
            node = result.get(key, {})
            result[key] = deep_merge(node, value)
        elif isinstance(value, list):
            # If the key points to a list, handle merging of list items
            if key not in result or not isinstance(result[key], list):
                result[key] = []
            
            source_list = result[key]
            # Create a map of id -> index for fast lookups
            source_index_map = {item['id']: i for i, item in enumerate(source_list) if isinstance(item, dict) and 'id' in item}

            for item in value:
                if isinstance(item, dict) and 'id' in item:
                    item_id = item['id']
                    if item_id in source_index_map:
                        # If item exists in source, merge them and update the list
                        source_index = source_index_map[item_id]
                        source_list[source_index] = deep_merge(source_list[source_index], item)
                    else:
                        # If item is new, append it
                        source_list.append(item)
                else:
                    # If item is not a dict with an id, just append it
                     source_list.append(item)
        else:
            # For all other value types, just overwrite
            result[key] = value

    return result 