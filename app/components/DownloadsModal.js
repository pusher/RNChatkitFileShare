import React, { Component } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import DownloadsList from "./DownloadsList";

const DownloadsModal = ({ is_visible, files, closeModal }) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={is_visible}
      onRequestClose={() => {
        console.log("modal closed");
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalMain}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Files</Text>
            <TouchableOpacity onPress={closeModal}>
              <MaterialIcons name="close" size={25} color="#333" />
            </TouchableOpacity>
          </View>

          <DownloadsList files={files} />
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    marginTop: 22
  },
  modalMain: {
    padding: 10
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },
  modalHeaderText: {
    fontSize: 20
  }
};

export default DownloadsModal;
