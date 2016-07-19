App.controller('UnitController', function($scope, $rootScope, $location, bus){
  console.log($rootScope);

  $rootScope.nav = "units";

  $scope.units = $rootScope.user.units;

  $scope.itemName = function(unit, slot){
    var item = $rootScope.items[unit.equipment[slot]];

    return item ? item.name : "Nothing";
  }

  $equipItem = $("#equipItem");
  $itemRows = $(".items").find("tbody");

  $scope.equipItem = function(unitId, slot){
    $equipItem.find(".slotName").text($rootScope.enums.EquipmentSlot[slot]);

    $itemRows.empty();

    $itemRows.append(equipItemRow(unitId, slot, {id: 0, name: 'Nothing'}))

    for(var i = 0; i < $rootScope.user.inventory.length; i++){
      var inventoryItem = $rootScope.user.inventory[i];
      var item = $rootScope.items[inventoryItem.itemId];

      if(item.equipmentSlot != slot)
        continue;

      $itemRows.append(equipItemRow(unitId, slot, item, inventoryItem));
    }

    $equipItem.modal();
  }

  var equipItemRow = function(unitId, slot, item, inventoryItem){
    return $("<tr/>").data({ unitId: unitId, slot: slot, itemId: item.id }).append(
              $("<td/>").text(item.name))
            .append(
              $("<td/>").text(inventoryItem ? inventoryItem.available + "/" + inventoryItem.total : ""))
            .append(
              $("<td/>").append(
                $("<button/>").click($scope.setItem).append(
                  $("<span/>").text("Equip")
                )));
  }

  $scope.setItem = function(){
    $row = $(this).closest("tr");

    var unitId = $row.data("unitId");
    var slot = $row.data("slot");
    var itemId = $row.data("itemId");

    $.post("/unit/" + $rootScope.user.id + "/" + unitId + "/setItem/" + slot + "/" + itemId, {token: $rootScope.user.token}, function(resp){
      if(resp.success){
        $scope.units[unitId].equipment[slot] = itemId;

        $rootScope.user = resp.user;

        $scope.$apply();
      }

      $equipItem.modal("toggle");
    });

    $equipItem.find("button").prop("disabled", true);
  }
});
